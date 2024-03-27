import pkg from "jsonld";

const { frame } = pkg;

export default function (
  data: any,
  type: string,
  domain?: boolean
): Promise<any> {
  const runtimeConfig = useRuntimeConfig();
  const base = runtimeConfig.public.base;
  const context = function () {
    return {
      "@base": `${base}`,
      rdfs: "http://www.w3.org/2000/01/rdf-schema#",
      skos: "http://www.w3.org/2004/02/skos/core#",
      xkos: "http://rdf-vocabulary.ddialliance.org/xkos#",
      skosxl: "http://www.w3.org/2008/05/skos-xl#",
      skosno: "https://data.norge.no/vocabulary/skosno#",
      skosno2: "http://difi.no/skosno#",
      skosp: "http://www.data.ub.uib.no/ns/spraksamlingene/skos#",
      dct: "http://purl.org/dc/terms/",
      dcat: "http://www.w3.org/ns/dcat#",
      xsd: "http://www.w3.org/2001/XMLSchema#",
      vcard: "http://www.w3.org/2006/vcard/ns#",
      prov: "http://www.w3.org/ns/prov#",
      euvoc: "http://publications.europa.eu/ontology/euvoc#",
      literalForm: { "@id": "skosxl:literalForm", "@container": "@set" },
      type: { "@id": "@type", "@container": "@set" },
      label: "rdfs:label",
      created: "dct:created",
      modified: "dct:modified",
      identifier: "dct:identifier",
      language: "dct:language",
      source: "dct:source",
      scopeNote: "skos:scopeNote",
      note: "skos:note",
      license: "dct:license",
      value: "prov:value",
      status: "euvoc:status",
      opprinneligSpraak: "skosp:opprinneligSpraak",
      isOfAbbreviationType: "skosp:isOfAbbreviationType",
      isAbbreviationOf: "skosp:isAbbreviationOf",
      nonLingusticLabel: "skosp:nonLinguisticLabel",
      isCollocatedWith: {
        "@id": "skosp:isCollocatedWith",
        "@container": "@set",
      },
      notation: {
        "@id": "skos:notation",
        "@container": "@set",
      },
      hasUsage: {
        "@id": "skosp:hasUsage",
        "@container": "@set",
      },
      contactPoint: "dcat:contactPoint",
      hasTelephone: "vcard:hasTelephone",
      hasEmail: { "@id": "vcard:hasEmail", "@type": "@id" },
      domene: { "@id": "skosp:domene", "@type": "@id" },
      publisere: { "@id": "skosp:publisere", "@type": "xsd:boolean" },
      description: {
        "@id": "dct:description",
        "@container": "@language",
      },
      semanticRelation: {
        "@id": "skos:semanticRelation",
        "@type": "@id",
        "@container": "@set",
      },
      related: {
        "@id": "skos:related",
        "@type": "@id",
        "@container": "@set",
      },
      broader: {
        "@id": "skos:broader",
        "@type": "@id",
        "@container": "@set",
      },
      specializes: {
        "@id": "xkos:specializes",
        "@type": "@id",
        "@container": "@set",
      },
      isPartOf: {
        "@id": "xkos:isPartOf",
        "@type": "@id",
        "@container": "@set",
      },
      narrower: {
        "@id": "skos:narrower",
        "@type": "@id",
        "@container": "@set",
      },
      generalizes: {
        "@id": "xkos:generalizes",
        "@type": "@id",
        "@container": "@set",
      },
      hasPart: {
        "@id": "xkos:hasPart",
        "@type": "@id",
        "@container": "@set",
      },
      seeAlso: {
        "@id": "rdfs:seeAlso",
        "@type": "@id",
        "@container": "@set",
      },
      replaces: {
        "@id": "dct:replaces",
        "@type": "@id",
        "@container": "@set",
      },
      replacedBy: {
        "@id": "dct:replacedBy",
        "@type": "@id",
        "@container": "@set",
      },
      // generic concept relation
      hasGenericConceptRelation: {
        "@id": "skosno:hasGenericConceptRelation",
        "@type": "@id",
        "@container": "@set",
      },
      hasGenericConcept: {
        "@id": "skosno:hasGenericConcept",
        "@type": "@id",
        "@container": "@set",
      },
      hasSpecificConcept: {
        "@id": "skosno:hasSpecificConcept",
        "@type": "@id",
        "@container": "@set",
      },

      // partitive concept relation
      hasPartitiveConceptRelation: {
        "@id": "skosno:hasPartitiveConceptRelation",
        "@type": "@id",
        "@container": "@set",
      },
      hasPartitiveConcept: {
        "@id": "skosno:hasPartitiveConcept",
        "@type": "@id",
        "@container": "@set",
      },
      hasComprehensiveConcept: {
        "@id": "skosno:hasComprehensiveConcept",
        "@type": "@id",
        "@container": "@set",
      },
      // associative concept relation
      isFromConceptIn: {
        "@id": "skosno:isFromConceptIn",
        "@type": "@id",
        "@container": "@set",
      },
      hasToConcept: {
        "@id": "skosno:hasToConcept",
        "@type": "@id",
        "@container": "@set",
      },

      subject: {
        "@id": "dct:subject",
        "@container": "@set",
      },
      equivalence: {
        "@id": "skosp:equivalence",
        "@container": "@set",
      },
      equivalenceValue: "skosp:equivalenceValue",
      memberOf: {
        "@id": "skosp:memberOf",
        "@type": "@id",
      },
      prefLabel: {
        "@id": "skosxl:prefLabel",
        "@type": "@id",
        "@container": "@set",
      },
      altLabel: {
        "@id": "skosxl:altLabel",
        "@type": "@id",
        "@container": "@set",
      },
      definisjon: {
        "@id": "skosno:definisjon",
        "@type": "@id",
        "@container": "@set",
      },
      // backward compatibility
      betydningsbeskrivelse: {
        "@id": "skosno2:betydningsbeskrivelse",
        "@type": "@id",
        "@container": "@set",
      },
      hiddenLabel: {
        "@id": "skosxl:hiddenLabel",
        "@type": "@id",
        "@container": "@set",
      },
      publisher: {
        "@id": "dct:publisher",
        "@type": "@id",
      },
    };
  };

  if (!domain) {
    return frame(data, {
      "@context": [context()],
      "@type": type,
      "@embed": "@always",
      // don't embed semantic relations
      semanticRelation: { "@type": "skos:Concept", "@embed": "@never" },
      related: { "@type": "skos:Concept", "@embed": "@never" },
      broader: { "@type": "skos:Concept", "@embed": "@never" },
      specializes: { "@type": "skos:Concept", "@embed": "@never" },
      isPartOf: { "@type": "skos:Concept", "@embed": "@never" },
      narrower: { "@type": "skos:Concept", "@embed": "@never" },
      generalizes: { "@type": "skos:Concept", "@embed": "@never" },
      hasPart: { "@type": "skos:Concept", "@embed": "@never" },
      seeAlso: { "@type": "skos:Concept", "@embed": "@never" },
      replaces: { "@type": "skos:Concept", "@embed": "@never" },
      replacedBy: { "@type": "skos:Concept", "@embed": "@never" },
    });
  } else {
    return frame(data, {
      "@context": [context()],
      "@type": type,
      "@embed": "@always",
      narrower: { "@type": "skos:Concept", "@embed": "@never" },
    });
  }
}
