import pkg from "jsonld";

const { compact } = pkg;

export async function compactData(data: any, base: string) {
  const context = function () {
    return {
      "@base": `${base}`,
      rdfs: "http://www.w3.org/2000/01/rdf-schema#",
      skos: "http://www.w3.org/2004/02/skos/core#",
      xkos: "http://rdf-vocabulary.ddialliance.org/xkos#",
      skosxl: "http://www.w3.org/2008/05/skos-xl#",
      skosno: "https://vokab.norge.no/skosno#",
      skosno2: "http://difi.no/skosno#",
      skosp: "http://www.data.ub.uib.no/ns/spraksamlingene/skos#",
      dcterms: "http://purl.org/dc/terms/",
      xsd: "http://www.w3.org/2001/XMLSchema#",
      vcard: "http://www.w3.org/2006/vcard/ns#",
      literalForm: "skosxl:literalForm",
      label: "rdfs:label",
      domene: "skosp:domene",
      modified: "dcterms:modified",
      identifier: "dcterms:identifier",
      language: "dcterms:language",
      scopeNote: "skos:scopeNote", // TODO
      opprinneligSpraak: "skosp:opprinneligSpraak",
      hasTelephone: "vcard:hasTelephone",
      hasEmail: { "@id": "vcard:hasEmail", "@type": "@id" },
      description: {
        "@id": "dcterms:description",
        "@container": "@set",
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

      subject: {
        "@id": "dcterms:subject",
        "@type": "@id",
        "@container": "@set",
      },
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
        "@id": "dcterms:publisher",
        "@type": "@id",
      },
      source: {
        "@id": "dcterms:source",
        "@type": "@id",
      },
    };
  };

  try {
    return await compact(data, context());
  } catch {}
}
