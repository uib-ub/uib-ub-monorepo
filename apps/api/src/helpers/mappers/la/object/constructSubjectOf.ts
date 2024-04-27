import omitEmptyEs from 'omit-empty-es';
import { attributionNoDerivsType, attributionNonCommercialNoDerivsType, attributionNonCommercialType, attributionShareAlikeType, attributionType, publicDomainType, rsCopyrightUndeterminedType, rsInCopyrighttype } from '../../staticMapping';
import { TBaseMetadata } from '../../../../models';

const getLicenseMapping = (licenseName: string) => {
  switch (licenseName) {
    case 'Attribution-NonCommercial-NoDerivs':
      return attributionNonCommercialNoDerivsType
    case 'Attribution':
      return attributionType
    case 'Attribution-ShareAlike':
      return attributionShareAlikeType
    case 'CC BY-NC-ND 3.0':
      return attributionNonCommercialNoDerivsType;
    case 'CC BY-NC-ND 4.0':
      return attributionNonCommercialNoDerivsType;
    case 'Attribution-NonCommercial':
      return attributionNonCommercialType;
    case 'Attribution-NoDerivs':
      return attributionNoDerivsType;
    case 'In-Copyright':
      return rsInCopyrighttype;
    case 'Public Domain':
      return publicDomainType;
    default:
      return rsCopyrightUndeterminedType;
  }
};

function getIsInPublicDomainQuery(id: string) {
  const query = `
    PREFIX ubbont: <http://data.ub.uib.no/ontology/>
    PREFIX dct: <http://purl.org/dc/terms/>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX dbo: <http://dbpedia.org/ontology/>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    CONSTRUCT {
    ?s dct:title ?title ;
      dct:identifier ?id ;
      ubbont:madeBefore ?date ;
      dct:license "Public Domain" .
    }
    WHERE {
      VALUES ?id {"${id}"}
      {
        ?s dct:identifier ?id .
        ?s ubbont:madeBefore ?date .
        OPTIONAL { ?s dct:title ?title }
        FILTER (regex(str(?date), "\\\\d{4}-\\\\d{2}-\\\\d{2}") && (year(now()) - year(xsd:dateTime(?date)) >= 50))
      } 
      UNION 
      {
        ?s dct:identifier ?id .
        ?s dct:created ?date .
        OPTIONAL { ?s dct:title ?title }
        FILTER (regex(str(?date), "\\\\d{4}-\\\\d{2}-\\\\d{2}") && (year(now()) - year(xsd:dateTime(?date)) >= 50))
      } 
      UNION 
      {
        ?s dct:identifier ?id .
        ?s dct:created ?date .
        OPTIONAL { ?s dct:title ?title }
        FILTER (regex(str(?date), "\\\\d{4}") && (year(now()) - year(?date) >= 50))
      } 
      UNION 
      {
        ?s dct:identifier ?id .
        ?s foaf:maker ?maker .
        ?maker dbo:deathDate ?date .
        OPTIONAL { ?s dct:title ?title }
        FILTER (regex(str(?date), "\\\\d{4}-\\\\d{2}-\\\\d{2}") && (year(now()) - year(xsd:dateTime(?date)) >= 70))
      }
      UNION 
      {
        ?s dct:identifier ?id .
        ?s foaf:maker ?maker .
        ?maker dbo:deathYear ?date .
        OPTIONAL { ?s dct:title ?title }
        FILTER (regex(str(?date), "\\\\d{4}") && (year(now()) - year(?date) >= 70))
      }
    }`

  return query
}

export const constructLicense = async (base: TBaseMetadata, data: any) => {
  const {
    license,
  } = data;

  delete data.license;
  delete data.rightsHolder;

  // We have to check if the work is in the public domain, as we are missing a lot of rights statements.
  // The query is constructed to check if the work is older than 50 years, or if the creator has been dead for more than 70 years.
  // A positive result will override the license statement.
  let isPublicDomain: any = null;

  try {
    const url = `https://sparql.ub.uib.no/sparql/query?query=${encodeURIComponent(getIsInPublicDomainQuery(base.identifier))}&output=json`
    const response = await fetch(url);
    if (!response.ok) {
      console.log(`Request failed with status ${response.status}`);
    }
    isPublicDomain = await response.json();
  } catch (error) {
    console.error("Error:", error);
  }

  const rightsStatement = getLicenseMapping(isPublicDomain?.['dct:license'] || license || 'default')


  return omitEmptyEs({
    ...data,
    subject_to: [
      {
        id: base.newId,
        type: "Right",
        _label: "Rights statement for work",
        classified_as: [
          {
            id: "http://vocab.getty.edu/aat/300417696",
            type: "Type",
            _label: "Rights (Legal Concept)"
          },
          rightsStatement,
        ],
        referred_to_by: [
          {
            id: "https://data.getty.edu/museum/collection/object/6ea43ea4-0fd2-4310-b98a-b83dae8733e7/licensing/description",
            type: "LinguisticObject",
            _label: "Rights Statement Description",
            classified_as: [
              {
                id: "http://vocab.getty.edu/aat/300418049",
                type: "Type",
                _label: "Brief Text"
              }
            ],
            content: rightsStatement._label
          }
        ],
        possessed_by: [
          data.current_owner
        ],
        subject_of: [
          {
            id: "https://data.ub.uib.no/????/licensing/acknowledgements",
            type: "LinguisticObject",
            _label: "Acknowledgements for Work Rights",
            classified_as: [
              {
                id: "http://vocab.getty.edu/aat/300026687",
                type: "Type",
                _label: "Acknowledgements"
              }
            ],
            content: "Works are provided by the University of Bergen Library. All works are licensed or marked under the respective rights statements."
          }
        ]
      },
      {
        id: "https://data.ub.uib.no/collection/ubb",
        type: "Right",
        _label: "License for Collection Metadata",
        classified_as: [
          {
            id: "http://vocab.getty.edu/aat/300417696",
            type: "Type",
            _label: "Rights (Legal Concept)"
          },
          {
            id: "http://creativecommons.org/publicdomain/zero/1.0/", // @TODO: We have decided long ago that metadata is CC0, but will this apply in all cases and for all collections?.
            type: "Type",
            _label: "CC0 1.0 Universal (CC0 1.0) Public Domain Dedication"
          }
        ],
        referred_to_by: [
          {
            id: "https://data.getty.edu/museum/collection/object/6ea43ea4-0fd2-4310-b98a-b83dae8733e7/licensing/description",
            type: "LinguisticObject",
            _label: "License Description",
            classified_as: [
              {
                id: "http://vocab.getty.edu/aat/300418049",
                type: "Type",
                _label: "Brief Text"
              }
            ],
            content: "No Copyright"
          }
        ],
        possessed_by: [
          {
            id: "https://data.ub.uib.no/instance/organization/0f4d957a-5476-4e88-b2b6-71a06c1ecf9c",
            type: "Group",
            _label: "The University of Bergen Library",
            /*  member_of: [ // Do we need this?
               {
                 id: "http://vocab.getty.edu/ulan/500115987",
                 type: "Group",
                 _label: "The University of Bergen Library",
                 classified_as: [
                   {
                     id: "http://vocab.getty.edu/ulan/500000003",
                     type: "Type",
                     _label: "Corporate Bodies"
                   }
                 ]
               }
             ] */
          }
        ],
        subject_of: [
          {
            id: "https://data.ub.uib.no/???/licensing/acknowledgements",
            type: "LinguisticObject",
            _label: "Acknowledgements for Collection Metadata",
            classified_as: [
              {
                id: "http://vocab.getty.edu/aat/300026687",
                type: "Type",
                _label: "Acknowledgements"
              }
            ],
            content: "Collection metadata provided by the University of Bergen Library. All metadata about collections and items are licensed under CC0 1.0 (http://creativecommons.org/publicdomain/zero/1.0/). The works themselves are licensed under the respective rights statements."
          }
        ]
      }
    ]
  });
};
