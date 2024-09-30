import { aatAcknowledgementsType, aatBriefTextType, aatRightsType, attributionNoDerivsType, attributionNonCommercialNoDerivsType, attributionNonCommercialType, attributionShareAlikeType, attributionType, ccPublicDomainMarkType, institutions, publicDomainType, rsCopyrightUndeterminedType, rsInCopyrighttype } from '@/helpers/mappers/staticMapping';
import { getLanguage } from '@helpers/mappers/getLanguage';
import { TBaseMetadata } from '@models';
import omitEmptyEs from 'omit-empty-es';

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

export const constructSubjectTo = async (base: TBaseMetadata, data: any) => {
  const {
    type,
    license,
    current_owner
  } = data;

  delete data.license;
  delete data.rightsHolder;

  // We have to check if the work is in the public domain, as we are missing a lot of rights statements.
  // The query is constructed to check if the work is older than 50 years, or if the creator has been dead for more than 70 years.
  // A positive result will override the license statement.
  let isPublicDomainCheckResult: any = null;

  if (type === 'HumanMadeObject') {
    try {
      const url = `https://sparql.ub.uib.no/sparql/query?query=${encodeURIComponent(getIsInPublicDomainQuery(base.identifier))}&output=json`
      const response = await fetch(url);
      if (!response.ok) {
        console.log(`Request failed with status ${response.status}`);
        return
      }
      isPublicDomainCheckResult = await response.json();
    } catch (error) {
      console.error("Error:", error);
    }
  }
  const { identified_by: rightsName, subject_of: rightsStatement, ...rightsAssertion } = getLicenseMapping(isPublicDomainCheckResult?.['dct:license'] || license || 'default')

  const workRightsStatement = {
    id: base.newId,
    type: "Right",
    _label: "Rights statement for work",
    classified_as: [
      aatRightsType,
      rightsAssertion,
    ],
    inherit_from: rightsAssertion,
    referred_to_by: [
      {
        id: "https://data.ub.uib.no/????/licensing/description",
        type: "LinguisticObject",
        _label: "Rights Statement Description",
        classified_as: [
          aatBriefTextType,
        ],
        content: rightsAssertion._label
      }
    ],
    possessed_by: current_owner,
    subject_of: [
      {
        id: "https://data.ub.uib.no/????/licensing/acknowledgements",
        type: "LinguisticObject",
        _label: "Acknowledgements for Work Rights",
        classified_as: [
          aatAcknowledgementsType,
        ],
        language: [getLanguage('en')],
        content: `Works are provided by the University of Bergen. ${rightsStatement.filter(s => s.language[0]._label === 'English')[0].content}`
      },
      {
        id: "https://data.ub.uib.no/????/licensing/acknowledgements",
        type: "LinguisticObject",
        _label: "Acknowledgements for Work Rights",
        classified_as: [
          aatAcknowledgementsType,
        ],
        language: [getLanguage('no')],
        content: `Verket er tilgjengeliggjort av Universitetet i Bergen. ${rightsStatement.filter(s => s.language[0]._label === 'Norwegian')[0].content}`
      }
    ]
  }

  const metadataRightsStatement = {
    id: "https://data.ub.uib.no/collection/ubb",
    type: "Right",
    _label: "License for Collection Metadata",
    classified_as: [
      aatRightsType,
      ccPublicDomainMarkType,
    ],
    inherit_from: ccPublicDomainMarkType,
    referred_to_by: [
      {
        type: "LinguisticObject",
        _label: "License Description",
        classified_as: [
          aatBriefTextType,
        ],
        content: "No Copyright"
      }
    ],
    possessed_by: [
      institutions.ubb // TODO: should this be the library or UiB?
    ],
    subject_of: [
      {
        id: "https://data.ub.uib.no/???/licensing/acknowledgements",
        type: "LinguisticObject",
        _label: "Acknowledgements for Collection Metadata",
        classified_as: [
          aatAcknowledgementsType,
        ],
        language: [getLanguage('en')],
        content: "Collection metadata provided by the University of Bergen Library. All metadata are licensed under CC0 1.0 (http://creativecommons.org/publicdomain/zero/1.0/). The works themselves are licensed or marked under the respective rights statements."
      },
      {
        id: "https://data.ub.uib.no/???/licensing/acknowledgements",
        type: "LinguisticObject",
        _label: "Kreditering for samlingens metadata",
        classified_as: [
          aatAcknowledgementsType,
        ],
        language: [getLanguage('no')],
        content: "Samlingens metadata er levert av Universitetsbiblioteket i Bergen. All metadata er lisensiert under CC0 1.0 (http://creativecommons.org/publicdomain/zero/1.0/). Verkene selv er lisensiert eller merket under de respektive rettighetsuttalelsene."
      }
    ]
  }


  return omitEmptyEs({
    ...data,
    subject_to: [
      data.type === 'HumanMadeObject' ? workRightsStatement : null,

    ]
  });
};
