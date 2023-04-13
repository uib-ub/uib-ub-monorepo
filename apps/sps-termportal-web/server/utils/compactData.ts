import pkg from "jsonld";

const { compact } = pkg;

export default function (data: any) {
  const runtimeConfig = useRuntimeConfig();
  const base = runtimeConfig.public.base;
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
      dct: "http://purl.org/dc/terms/",
      xsd: "http://www.w3.org/2001/XMLSchema#",
      vcard: "http://www.w3.org/2006/vcard/ns#",
      literalForm: "skosxl:literalForm",
      label: "rdfs:label",
      modified: "dct:modified",
      identifier: "dct:identifier",
      language: "dct:language",
      scopeNote: "skos:scopeNote", // TODO
      opprinneligSpraak: "skosp:opprinneligSpraak",
      hasTelephone: "vcard:hasTelephone",
      hasEmail: { "@id": "vcard:hasEmail", "@type": "@id" },
      domene: { "@id": "skosp:domene", "@type": "@id" },
      description: {
        "@id": "dct:description",
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
        "@id": "dct:subject",
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
        "@id": "dct:publisher",
        "@type": "@id",
      },
      source: {
        "@id": "dct:source",
        "@type": "@id",
      },
    };
  };

  try {
    return compact(data, context());
  } catch {}
}
