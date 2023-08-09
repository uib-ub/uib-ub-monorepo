import type { Context, Service, ServiceSchema } from "moleculer";
import { skaLegacyContext } from "../lib/legacy/skaContext";
import { wabLegacyContext } from "../lib/legacy/wabContext";
import jsonld from "jsonld";
import { apiFetch as fetch } from "../lib/helpers/fetch";
import { isObjectEmpty } from '../lib/helpers/isObjectEmpty';

const SKA_API = process.env.SKA_API
const WAB_API = process.env.WAB_API

interface LegacySettings {
	defaultName: string;
}

interface LegacyMethods {
	// uppercase(str: string): string;
}

interface LegacyLocalVars {
	myVar: string;
}

type LegacyThis = Service<LegacySettings> & LegacyMethods & LegacyLocalVars;

const LegacyService: ServiceSchema<LegacySettings> = {
	name: "legacy",

	/**
	 * Settings
	 */
	settings: {
		defaultName: "Moleculer",
	},

	/**
	 * Dependencies
	 */
	dependencies: [],

	/**
	 * Actions
	 */
	actions: {
		countLegacyWabBemerkung: {
			cached: true,
			rest: "GET /wab/bemerkung/count",
			timeout: 10000,
			retries: 3,
			visibility: "published",
			/** @param {Context} ctx  */
			async handler(ctx) {
				try {
					const data = await this.countWabBemerkung();
					if (data) {
						ctx.meta.$statusCode = 200
						return data
					}
				} catch (error) {
					ctx.meta.$statusCode = 400
					return error
				}
			}
		},
		countByTypeLegacyWabBemerkung: {
			cached: true,
			rest: "GET /wab/bemerkung/countByType",
			timeout: 10000,
			retries: 3,
			visibility: "published",
			/** @param {Context} ctx  */
			async handler(ctx) {
				try {
					const data = await this.countByTypeWabBemerkung();
					if (data) {
						ctx.meta.$statusCode = 200
						return data
					}
				} catch (error) {
					ctx.meta.$statusCode = 400
					return error
				}
			}
		},
		listLegacyWabBemerkung: {
			cached: true,
			rest: "GET /wab/bemerkung/list",
			params: {
				page: {
					type: "number",
					optional: true,
					default: 0,
					convert: true
				},
				limit: {
					type: "number",
					optional: true,
					default: 100,
					convert: true
				}
			},
			timeout: 10000,
			retries: 3,
			visibility: "published",
			/** @param {Context} ctx  */
			async handler(ctx) {
				const { page, limit } = ctx.params;
				try {
					const data = await this.listWabBemerkung(page, limit);
					if (data) {
						ctx.meta.$statusCode = 200
						return data
					}
				} catch (error) {
					ctx.meta.$statusCode = 400
					return error
				}
			}
		},
		getLegacyWabBemerkung: {
			rest: "GET /wab/bemerkung",
			params: {
				id: {
					type: "string",
					convert: true,
				},
			},
			timeout: 45000,
			retries: 3,
			visibility: "published",
			/** @param {Context} ctx  */
			async handler(ctx) {
				const { id } = ctx.params;
				try {
					const data = await this.getWabBemerkung(id);

					if (data) {
						ctx.meta.$statusCode = 200
						return data
					}
				} catch (error) {
					ctx.meta.$statusCode = 400
					return error
				}
			}
		},
		getLegacySkaAgents: {
			rest: "GET /ska/agents",
			timeout: 10000,
			retries: 3,
			visibility: "published",
			/** @param {Context} ctx  */
			async handler(ctx) {
				try {
					const data = await this.getSkaAgents();

					if (data) {
						ctx.meta.$statusCode = 200
						return data
					}
				} catch (error) {
					ctx.meta.$statusCode = 400
					return error
				}
			}
		},
		getLegacySkaDocuments: {
			rest: "GET /ska/documents",
			timeout: 10000,
			retries: 3,
			visibility: "published",
			/** @param {Context} ctx  */
			async handler(ctx) {
				try {
					const data = await this.getSkaDocuments();

					if (data) {
						ctx.meta.$statusCode = 200
						return data
					}
				} catch (error) {
					ctx.meta.$statusCode = 400
					return error
				}
			}
		},
		getLegacySkaTopics: {
			rest: "GET /ska/topics",
			timeout: 10000,
			retries: 3,
			visibility: "published",
			/** @param {Context} ctx  */
			async handler(ctx) {
				try {
					const data = await this.getSkaTopics();

					if (data) {
						ctx.meta.$statusCode = 200
						return data
					}
				} catch (error) {
					ctx.meta.$statusCode = 400
					return error
				}
			}
		},
		/* Unused */
		getLegacySkaObjects: {
			rest: "GET /ska/objects",
			timeout: 10000,
			retries: 3,
			visibility: "published",
			/** @param {Context} ctx  */
			async handler(ctx) {
				try {
					const data = await this.getSkaObjects();

					if (data) {
						ctx.meta.$statusCode = 200
						return data
					}
				} catch (error) {
					ctx.meta.$statusCode = 400
					return error
				}
			}
		},
		getLegacySkaOrganization: {
			rest: "GET /ska/organization",
			timeout: 10000,
			retries: 3,
			visibility: "published",
			/** @param {Context} ctx  */
			async handler(ctx) {
				try {
					const data = await this.getSkaOrganization();

					if (data) {
						ctx.meta.$statusCode = 200
						return data
					}
				} catch (error) {
					ctx.meta.$statusCode = 400
					return error
				}
			}
		},
		getLegacySkaPersons: {
			rest: "GET /ska/persons",
			timeout: 10000,
			retries: 3,
			visibility: "published",
			/** @param {Context} ctx  */
			async handler(ctx) {
				try {
					const data = await this.getSkaPersons();

					if (data) {
						ctx.meta.$statusCode = 200
						return data
					}
				} catch (error) {
					ctx.meta.$statusCode = 400
					return error
				}
			}
		},
	},

	/**
	 * Events
	 */
	events: {},

	/**
	 * Methods
	 */
	methods: {
		async getSkaAgents() {
			const query = `
			PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> 
			PREFIX ubbont: <http://data.ub.uib.no/ontology/> 
			PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> 
			PREFIX foaf: <http://xmlns.com/foaf/0.1/> 
			PREFIX dct: <http://purl.org/dc/terms/> 
			PREFIX bibo: <http://purl.org/ontology/bibo/> 
			PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> 
			PREFIX owl: <http://www.w3.org/2002/07/owl#> 
			PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
			PREFIX skos: <http://www.w3.org/2004/02/skos/core#> 
			PREFIX dbo: <http://dbpedia.org/ontology/> 
			CONSTRUCT { 
				?s rdf:about ?s .
				?s rdf:type ?subclass . 
				?s skos:prefLabel ?preferredLabelStr .
				?s foaf:name ?nameStr .
				?s dbo:profession ?professionStr .
				?s foaf:familyName ?familyNameStr .
				?s foaf:firstName ?firstNameStr .
				?s dbo:birthDate ?birthDateStr .
				?s dbo:birthYear ?birthYearStr .
				?s dbo:deathDate ?deathDateStr .
				?s dbo:deathYear ?deathYearStr .
				?s foaf:gender ?gender .
				?s dct:dateAccepted ?dateAccepted .
				?s foaf:based_near ?basedNearStr .
				?s dbo:deathPlace ?deathPlaceStr .
				?s dbo:birthPlace ?birthPlaceStr .
			} 
			WHERE { 
				GRAPH <urn:x-arq:UnionGraph> { 
					?subclass rdfs:subClassOf* foaf:Agent . 
					?s0 rdf:type ?subclass . 
					OPTIONAL { 
						?s0 skos:prefLabel ?preferredLabel 
						BIND(str(?preferredLabel) as ?preferredLabelStr)
					} .
					OPTIONAL { 
						?s0 foaf:name ?name 
						BIND(str(?name) as ?nameStr)
					} .
					OPTIONAL { 
						?s0 dbo:profession ?profession 
						BIND(str(?profession) as ?professionStr)
					} .
					OPTIONAL { 
						?s0 foaf:familyName ?familyName 
						BIND(str(?familyName) as ?familyNameStr)
					} .
					OPTIONAL { 
						?s0 foaf:firstName ?firstName 
						BIND(str(?firstName) as ?firstNameStr)
					} .
					OPTIONAL { 
						?s0 foaf:based_near/skos:prefLabel ?basedNear 
						BIND(str(?basedNear) as ?basedNearStr)
					} .
					OPTIONAL { 
						?s0 dbo:deathPlace/skos:prefLabel ?deathPlace 
						BIND(str(?deathPlace) as ?deathPlaceStr)
					} .
					OPTIONAL { 
						?s0 dbo:birthPlace/skos:prefLabel ?birthPlace 
						BIND(str(?birthPlace) as ?birthPlaceStr)
					} .
					OPTIONAL { 
						?s0 dbo:birthDate ?birthDate 
						BIND(str(?birthDate) as ?birthDateStr)
					} .
					OPTIONAL { 
						?s0 dbo:birthYear ?birthYear 
						BIND(str(?birthYear) as ?birthYearStr)
					} .
					OPTIONAL { 
						?s0 dbo:deathDate ?deathDate 
						BIND(str(?deathDate) as ?deathDateStr)
					} .
					OPTIONAL { 
						?s0 dbo:deathYear ?deathYear 
						BIND(str(?deathYear) as ?deathYearStr)
					} .
					OPTIONAL { ?s0 foaf:gender ?gender } .
					OPTIONAL { ?s0 dct:dateAccepted ?dateAccepted } .
					BIND(iri(replace(str(?s0), "http://data.ub.uib.no", "https://katalog.skeivtarkiv.no")) AS ?s) 
				} 
			}`

			try {
				const result = await fetch(
					`${SKA_API}${encodeURIComponent(
						query
					)}&output=json`).then((res: any) => res.json());

				if (isObjectEmpty(result)) {
					return []
				}

				// Expand and compact the result using the legacy context
				const expanded = await jsonld.expand(result)
				const compacted = await jsonld.compact(expanded, skaLegacyContext)

				return compacted['@graph'];
			} catch (error) {
				return error;
			}
		},
		async getSkaDocuments() {
			const query = `
			  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
				PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> 
				PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> 
				PREFIX foaf: <http://xmlns.com/foaf/0.1/> 
				PREFIX owl: <http://www.w3.org/2002/07/owl#> 
				PREFIX skos: <http://www.w3.org/2004/02/skos/core#> 
				PREFIX dct: <http://purl.org/dc/terms/> 
				PREFIX bibo: <http://purl.org/ontology/bibo/> 
				PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> 
				PREFIX event: <http://purl.org/NET/c4dm/event.owl#> 
				PREFIX ubbont: <http://data.ub.uib.no/ontology/> 
				CONSTRUCT { 
					?sR a ?subclass . 
					?sR rdf:about ?sR .
					?sR ubbont:isDigitized ?isDigitized . 
					?sR dct:identifier ?identifier . 
					?sR rdfs:label ?coalescedLabel . 
					?sR dct:isPartOf ?collectionStr . 
					?sR event:producedIn ?eventStr . 
					?sR dct:description ?descriptionStr. 
					?sR foaf:maker ?makerStr . 
					?sR dct:spatial ?spatialStr . 
					?sR dct:subject ?topicStr . 
					?sR dct:relation ?relationStr . 
					?sR ubbont:hasThumbnail ?thumbStr . 
					?sR dct:created ?created . 
					?sR dct:available ?available . 
					?sR ubbont:madeAfter ?madeAfter . 
					?sR ubbont:madeBefore ?madeBefore . 
					?sR ubbont:dateSort ?dateSort . 
				} 
				WHERE {
					GRAPH <urn:x-arq:UnionGraph> { 
						VALUES ?classes { bibo:Document ubbont:Object }
						?subclass rdfs:subClassOf* ?classes . 
						?s a ?subclass . 
						OPTIONAL { 
							?s dct:identifier ?identifier 
						} .
						OPTIONAL { 
							?s dct:title ?title .
							BIND (str(?title) AS ?titleStr) .
						} .
						OPTIONAL { 
							?s rdfs:label ?label .
							BIND (str(?label) AS ?labelStr) .
						} .
						OPTIONAL { 
							?s dct:spatial/skos:prefLabel ?spatial .
							BIND (str(?spatial) AS ?spatialStr) .
						} .
						OPTIONAL { 
							?s dct:relation/foaf:name ?relation .
							BIND (str(?relation) AS ?relationStr) .
						} .
						OPTIONAL { 
							?s dct:subject/skos:prefLabel ?topic .
							BIND (str(?topic) AS ?topicStr) .
						} .
						OPTIONAL { 
							?s skos:prefLabel ?prefLabel .
							BIND (str(?prefLabel) AS ?prefLabelStr) .
						} .
						OPTIONAL { 
							?s dct:description ?description .
							BIND (str(?description) AS ?descriptionStr) .
						} .
						OPTIONAL { 
							?s foaf:maker/foaf:name ?maker .
							BIND (str(?maker) AS ?makerStr) .
						} .
						OPTIONAL { 
							?s dct:isPartOf/dct:title ?collection.
							BIND (str(?collection) AS ?collectionStr) .
						} .
						OPTIONAL { 
							?s event:producedIn/skos:prefLabel ?event .
							BIND (str(?event) AS ?eventStr) .
						} .
						OPTIONAL { 
							?s ubbont:hasThumbnail ?thumb 
							BIND (str(?thumb) AS ?thumbStr) .
						} .
						OPTIONAL { 
							?s dct:created ?created0 .
							BIND (str(?created0) AS ?created) .
						} .
						OPTIONAL { 
							?s dct:available ?available0 .
							BIND (str(?available0) AS ?available) .
						} .
						OPTIONAL { 
							?s ubbont:madeAfter ?madeAfter0 .
							BIND (str(?madeAfter0) AS ?madeAfter) .
						} .
						OPTIONAL { 
							?s ubbont:madeBefore ?madeBefore0 .
							BIND (str(?madeBefore0) AS ?madeBefore) .
						} .
						OPTIONAL { 
							?s ubbont:dateSort ?dateSort0 
						} .
						MINUS { ?s a ubbont:Page.} 
						BIND (coalesce(?created, ?madeAfter, ?madeBefore) AS ?dateSort) 
						BIND (coalesce(?titleStr, ?labelStr) AS ?coalescedLabel) 
						BIND(EXISTS{?s ubbont:hasRepresentation ?rep} AS ?isDigitized0) 
						BIND(xsd:string(if(?isDigitized0 = true, "Digitalisert", "Ikke digitalisert")) as ?isDigitized) 
						BIND (iri(replace(str(?s), "http://data.ub.uib.no", "https://katalog.skeivtarkiv.no")) AS ?sR )
					}
				}`

			try {
				const result = await fetch(
					`${SKA_API}${encodeURIComponent(
						query
					)}&output=json`).then((res: any) => res.json());

				if (isObjectEmpty(result)) {
					return []
				}

				// Expand and compact the result using the legacy context
				const expanded = await jsonld.expand(result)
				const compacted = await jsonld.compact(expanded, skaLegacyContext)
				const graph = compacted['@graph'] as any[] ?? []

				// Recreate ES suggest prop from the graph
				const withSuggest = graph.map((item: any) => {
					const label = item.label
						? Array.isArray(item.label) ? item.label : [item.label]
						: []
					const title = item.title
						? Array.isArray(item.title) ? item.title : [item.title]
						: []
					const description = item.description
						? Array.isArray(item.description) ? item.description : [item.description]
						: []
					const identifier = item.identifier
						? Array.isArray(item.identifier) ? item.identifier : [item.identifier]
						: []
					const type = item.type
						? Array.isArray(item.type) ? item.type : [item.type]
						: []
					const maker = item.maker ?? []
					const subject = item.subject ?? []
					const spatial = item.spatial ?? []
					const array = [
						...identifier,
						...type,
						...label,
						...title,
						...description ?? undefined,
						...subject,
						...spatial,
						...maker
					].map((item: any) => item.toLowerCase())

					// The Drupal ES module uses "field_tags:name" which is illegal as a JSONLD key
					item['field_tags:name'] = item.subject

					return {
						...item,
						suggest: {
							input: array,
						}
					}
				})

				return withSuggest;
			} catch (error) {
				return error;
			}
		},
		async getSkaObjects() {
			const query = `
			  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> 
				PREFIX ubbont: <http://data.ub.uib.no/ontology/> 
				PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> 
				PREFIX foaf: <http://xmlns.com/foaf/0.1/> 
				PREFIX dct: <http://purl.org/dc/terms/> 
				PREFIX bibo: <http://purl.org/ontology/bibo/> 
				PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> 
				PREFIX owl: <http://www.w3.org/2002/07/owl#> 
				PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
				PREFIX skos: <http://www.w3.org/2004/02/skos/core#> 
				PREFIX event: <http://purl.org/NET/c4dm/event.owl#> 
				CONSTRUCT { 
					?sR rdf:type ?classLabel . 
					?sR dct:identifier ?identifier . 
					?sR rdfs:label ?label . 
					?sR dct:isPartOf ?collection . 
					?sR event:producedIn ?event . 
					?sR dct:description ?description . 
					?sR foaf:maker ?maker . 
					?sR dct:spatial ?spatial . 
					?sR dct:created ?created . 
					?sR dct:subject ?topic . 
					?sR dct:relation ?relation . 
					?sR ubbont:hasThumbnail ?thumb .
				} 
				WHERE { 
					{
						GRAPH <urn:x-arq:UnionGraph> { 
							?s rdf:type ubbont:Object . 
							?s rdf:type ?class 
							OPTIONAL { ?s dct:identifier ?identifier} 
							OPTIONAL { ?s dct:created ?created0} 
							OPTIONAL { ?s dct:title ?title} 
							OPTIONAL { ?s rdfs:label ?label2} 
							OPTIONAL { ?s skos:prefLabel ?prefLabel} 
							OPTIONAL { ?s dct:spatial/skos:prefLabel ?spatial} 
							OPTIONAL { ?s dct:description ?description} 
							OPTIONAL { ?s dct:relation/foaf:name ?relation} 
							OPTIONAL { ?s dct:subject/skos:prefLabel ?topic} 
							OPTIONAL { ?s foaf:maker/foaf:name ?maker} 
							OPTIONAL { ?s dct:isPartOf/dct:title ?collection} 
							OPTIONAL { ?s event:producedIn/skos:prefLabel ?event} 
							OPTIONAL { ?s ubbont:hasThumbnail ?thumb} 
							BIND(str(?created0) AS ?created) 
							BIND(iri(replace(str(?s), "data.ub.uib.no", "katalog.skeivtarkiv.no")) AS ?sR) 
							BIND(coalesce(?title, ?label2, ?prefLabel, ?identifier) AS ?label) 
						} 
						GRAPH ubbont:ubbont { 
							?class rdfs:label ?classLabel 
							FILTER langMatches(lang(?classLabel), "") 
						} 
					} 
					UNION 
					{ 
						GRAPH <urn:x-arq:UnionGraph> { 
							?subclass (rdfs:subClassOf)* ubbont:Object . 
							?s rdf:type ?subclass 
							OPTIONAL { ?s dct:identifier ?identifier} 
							OPTIONAL { ?s dct:created ?created0} 
							OPTIONAL { ?s dct:title ?title} 
							OPTIONAL { ?s rdfs:label ?label2} 
							OPTIONAL { ?s skos:prefLabel ?prefLabel} 
							OPTIONAL { ?s dct:spatial/skos:prefLabel ?spatial} 
							OPTIONAL { ?s dct:description ?description} 
							OPTIONAL { ?s dct:relation/foaf:name ?relation} 
							OPTIONAL { ?s dct:subject/skos:prefLabel ?topic} 
							OPTIONAL { ?s foaf:maker/foaf:name ?maker} 
							OPTIONAL { ?s dct:isPartOf/dct:title ?collection} 
							OPTIONAL { ?s event:producedIn/skos:prefLabel ?event} 
							OPTIONAL { ?s ubbont:hasThumbnail ?thumb} BIND(str(?created0) AS ?created) 
							BIND(iri(replace(str(?s), "http://data.ub.uib.no", "https://katalog.skeivtarkiv.no")) AS ?sR) 
							BIND(coalesce(?title, ?label2, ?prefLabel, ?identifier) AS ?label) 
						} 
						GRAPH ubbont:ubbont { 
							?subclass rdfs:label ?classLabel FILTER langMatches(lang(?classLabel), "")
						}
					}
				}`

			try {
				const result = await fetch(
					`${SKA_API}${encodeURIComponent(
						query
					)}&output=json`).then((res: any) => res.json());

				if (isObjectEmpty(result)) {
					return []
				}

				// Expand and compact the result using the legacy context
				const expanded = await jsonld.expand(result)
				const compacted = await jsonld.compact(expanded, skaLegacyContext)

				return compacted['@graph'];
			} catch (error) {
				return error;
			}
		},
		async getSkaOrganization() {
			const query = `
			  PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> 
				PREFIX foaf: <http://xmlns.com/foaf/0.1/> 
				PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
				PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
				PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> 
				PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> 
				PREFIX foaf: <http://xmlns.com/foaf/0.1/> 
				PREFIX owl: <http://www.w3.org/2002/07/owl#> 
				PREFIX skos: <http://www.w3.org/2004/02/skos/core#> 
				PREFIX dct: <http://purl.org/dc/terms/> 
				PREFIX nie: <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#> 
				PREFIX bio: <http://purl.org/vocab/bio/0.1/> 
				PREFIX bibo: <http://purl.org/ontology/bibo/> 
				PREFIX ubbont: <http://data.ub.uib.no/ontology/> 
				PREFIX dbo: <http://dbpedia.org/ontology/> 
				PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> 
				CONSTRUCT { 
					?sR <http://purl.org/dc/terms/identifier> ?identifier . 
					?sR <http://www.w3.org/2000/01/rdf-schema#label> ?label . 
					?sR <http://dbpedia.org/ontology/formationDate> ?birthDate . 
					?sR <http://dbpedia.org/ontology/extinctionDate> ?deathDate . 
					?sR <http://dbpedia.org/ontology/profession> ?profession. 
					?sR <http://www.w3.org/2004/02/skos/core#altLabel> ?altLabel . 
					?sR <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?classLabel . 
					?sR <http://xmlns.com/foaf/0.1/img> ?img . 
					?sR <http://schema.org/honorificPrefix> ?prefix . 
					?sR <http://xmlns.com/foaf/0.1/name> ?name . 
					?sR <http://xmlns.com/foaf/0.1/familyName> ?familyName . 
					?sR <http://xmlns.com/foaf/0.1/firstName> ?firstName . 
					?sR <http://xmlns.com/foaf/0.1/gender> ?gender . 
					?sR <http://dbpedia.org/ontology/birthName> ?birthName . 
				} 
				WHERE { 
					{ 
						GRAPH <urn:x-arq:UnionGraph> {
							?s a foaf:Organization . 
							?s a ?class . 
							OPTIONAL {?s <http://purl.org/dc/terms/identifier> ?identifier .} 
							OPTIONAL {?s <http://www.w3.org/2000/01/rdf-schema#label> ?label .} 
							OPTIONAL {?s <http://dbpedia.org/ontology/formationDate> ?birthDate0 .} 
							OPTIONAL {?s <http://dbpedia.org/ontology/extinctionDate> ?deathDate0 .} 
							OPTIONAL {?s <http://www.w3.org/2004/02/skos/core#altLabel> ?label .} 
							OPTIONAL {?s <http://xmlns.com/foaf/0.1/img> ?img .} 
							OPTIONAL {?s <http://xmlns.com/foaf/0.1/name> ?name .} 
							BIND (str(?birthDate0) AS ?birthDate) 
							BIND (str(?deathDate0) AS ?deathDate) 
							BIND (iri(replace(str(?s), "data.ub.uib.no", "katalog.skeivtarkiv.no")) AS ?sR ) 
						} 
						GRAPH ubbont:ubbont { 
							?class rdfs:label ?classLabel . 
							FILTER (langMatches(lang(?classLabel),"")) 
						} 
					} 
					UNION { 
						GRAPH <urn:x-arq:UnionGraph> {
							?subclass rdfs:subClassOf* foaf:Organization . 
							?s a ?subclass . 
							OPTIONAL {?s <http://purl.org/dc/terms/identifier> ?identifier .} 
							OPTIONAL {?s <http://www.w3.org/2000/01/rdf-schema#label> ?label .} 
							OPTIONAL {?s <http://dbpedia.org/ontology/formationDate> ?birthDate0 .} 
							OPTIONAL {?s <http://dbpedia.org/ontology/extinctionDate> ?deathDate0 .} 
							OPTIONAL {?s <http://www.w3.org/2004/02/skos/core#altLabel> ?label .} 
							OPTIONAL {?s <http://xmlns.com/foaf/0.1/img> ?img .} 
							OPTIONAL {?s <http://xmlns.com/foaf/0.1/name> ?name .} 
							BIND (str(?birthDate0) AS ?birthDate) 
							BIND (str(?deathDate0) AS ?deathDate) 
							BIND (iri(replace(str(?s), "http://data.ub.uib.no", "https://katalog.skeivtarkiv.no")) AS ?sR ) 
						} 
						GRAPH ubbont:ubbont { 
							?subclass rdfs:label ?classLabel . 
							FILTER (langMatches(lang(?classLabel),""))
						}
					}
				}`

			try {
				const result = await fetch(
					`${SKA_API}${encodeURIComponent(
						query
					)}&output=json`).then((res: any) => res.json());

				if (isObjectEmpty(result)) {
					return []
				}

				// Expand and compact the result using the legacy context
				const expanded = await jsonld.expand(result)
				const compacted = await jsonld.compact(expanded, skaLegacyContext)

				return compacted['@graph'];
			} catch (error) {
				return error;
			}
		},
		async getSkaPersons() {
			const query = `
			  PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> 
				PREFIX foaf: <http://xmlns.com/foaf/0.1/> 
				PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
				PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
				PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> 
				PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> 
				PREFIX foaf: <http://xmlns.com/foaf/0.1/> 
				PREFIX owl: <http://www.w3.org/2002/07/owl#> 
				PREFIX skos: <http://www.w3.org/2004/02/skos/core#> 
				PREFIX dct: <http://purl.org/dc/terms/> 
				PREFIX nie: <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#> 
				PREFIX bio: <http://purl.org/vocab/bio/0.1/> 
				PREFIX bibo: <http://purl.org/ontology/bibo/> 
				PREFIX ubbont: <http://data.ub.uib.no/ontology/> 
				PREFIX dbo: <http://dbpedia.org/ontology/> 
				PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> 
				
				CONSTRUCT { 
					?sR <http://purl.org/dc/terms/identifier> ?identifier . 
					?sR <http://www.w3.org/2000/01/rdf-schema#label> ?label . 
					?sR <http://dbpedia.org/ontology/birthDate> ?birthDate . 
					?sR <http://dbpedia.org/ontology/deathDate> ?deathDate . 
					?sR <http://dbpedia.org/ontology/profession> ?profession. 
					?sR <http://www.w3.org/2004/02/skos/core#altLabel> ?altLabel . 
					?sR <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?classLabel .
					?sR <http://xmlns.com/foaf/0.1/img> ?img . 
					?sR <http://schema.org/honorificPrefix> ?prefix . 
					?sR <http://xmlns.com/foaf/0.1/name> ?name .
					?sR <http://xmlns.com/foaf/0.1/familyName> ?familyName . 
					?sR <http://xmlns.com/foaf/0.1/firstName> ?firstName . 
					?sR <http://xmlns.com/foaf/0.1/gender> ?gender .
					?sR <http://dbpedia.org/ontology/birthName> ?birthName . 
				} 
				WHERE { 
					GRAPH <urn:x-arq:UnionGraph> {
						?s a foaf:Person . 
						?s a ?class . 
						OPTIONAL {?s <http://purl.org/dc/terms/identifier> ?identifier .} 
						OPTIONAL {?s <http://www.w3.org/2000/01/rdf-schema#label> ?label .} 
						OPTIONAL {?s <http://dbpedia.org/ontology/birthDate> ?birthDate0 .} 
						OPTIONAL {?s <http://dbpedia.org/ontology/deathDate> ?deathDate0 .} 
						OPTIONAL {?s <http://dbpedia.org/ontology/profession> ?profession.} 
						OPTIONAL {?s <http://www.w3.org/2004/02/skos/core#altLabel> ?label .} 
						OPTIONAL {?s <http://xmlns.com/foaf/0.1/img> ?img .} 
						OPTIONAL {?s <http://schema.org/honorificPrefix> ?prefix .} 
						OPTIONAL {?s <http://xmlns.com/foaf/0.1/name> ?name .} 
						OPTIONAL {?s <http://xmlns.com/foaf/0.1/familyName> ?familyName .} 
						OPTIONAL {?s <http://xmlns.com/foaf/0.1/firstName> ?firstName .} 
						OPTIONAL {?s <http://xmlns.com/foaf/0.1/gender> ?gender .} 
						OPTIONAL {?s <http://dbpedia.org/ontology/birthName> ?birthName .} 
						BIND (str(?birthDate0) AS ?birthDate) 
						BIND (str(?deathDate0) AS ?deathDate) 
						BIND (iri(replace(str(?s), "http://data.ub.uib.no", "https://katalog.skeivtarkiv.no")) AS ?sR ) 
					} 
					GRAPH ubbont:ubbont { 
						?class rdfs:label ?classLabel . 
						FILTER (langMatches(lang(?classLabel), "")) 
					}
				}`

			try {
				const result = await fetch(
					`${SKA_API}${encodeURIComponent(
						query
					)}&output=json`).then((res: any) => res.json());

				if (isObjectEmpty(result)) {
					return []
				}

				// Expand and compact the result using the legacy context
				const expanded = await jsonld.expand(result)
				const compacted = await jsonld.compact(expanded, skaLegacyContext)

				return compacted['@graph'];
			} catch (error) {
				return error;
			}
		},
		async getSkaTopics() {
			const query = `
			PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
			PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> 
			PREFIX xsd:<http://www.w3.org/2001/XMLSchema#> 
			PREFIX foaf: <http://xmlns.com/foaf/0.1/> 
			PREFIX owl:<http://www.w3.org/2002/07/owl#> 
			PREFIX skos: <http://www.w3.org/2004/02/skos/core#> 
			PREFIX dct: <http://purl.org/dc/terms/> 
			PREFIX bibo:<http://purl.org/ontology/bibo/> 
			PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> 
			PREFIX ubbont: <http://data.ub.uib.no/ontology/> 
			CONSTRUCT {
			  ?sR skos:prefLabel ?label . 
				?sR rdf:type ?classLabel . 
			} 
			WHERE { 
				GRAPH <urn:x-arq:UnionGraph> { 
					?uri a skos:Concept. 
					?uri a ?class . 
					?uri skos:prefLabel ?label. 
					FILTER EXISTS {?uri ubbont:isSubjectOf ?subject } 
					BIND (iri(replace(str(?uri), "http://data.ub.uib.no", "https://katalog.skeivtarkiv.no")) AS ?sR )
				} 
				GRAPH ubbont:ubbont { 
					?class rdfs:label ?classLabel .
					 FILTER (langMatches(lang(?classLabel),"")) 
			 } 
		  }`

			try {
				const result = await fetch(
					`${SKA_API}${encodeURIComponent(
						query
					)}&output=json`).then((res: any) => res.json());

				if (isObjectEmpty(result)) {
					return []
				}

				// Expand and compact the result using the legacy context
				const expanded = await jsonld.expand(result)
				const compacted = await jsonld.compact(expanded, skaLegacyContext)

				return compacted['@graph'];
			} catch (error) {
				return error;
			}
		},
		async countWabBemerkung() {
			const query = `
			PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
			PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
			PREFIX ws: <http://purl.org/wittgensteinsource/ont/>
			PREFIX dct: <http://purl.org/dc/terms/> 
			SELECT (count(distinct ?uri) as ?count)
			WHERE	{ 
				VALUES ?class { ws:Bemerkung ws:DiaryEntry ws:Correspondence ws:Recollection ws:LectureNotes ws:MS ws:TS }
				?uri a ?class .
			}
			ORDER BY ?uri`

			try {
				const result = await fetch(
					`${WAB_API}${encodeURIComponent(
						query,
					)}&output=json`,
				).then((res: any) => res.json())

				return result.results.bindings[0].count.value
			} catch (error) {
				this.logger.warn(error)
			}
		},
		async countByTypeWabBemerkung() {
			const query = `
			PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
			PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
			PREFIX ws: <http://purl.org/wittgensteinsource/ont/>
			PREFIX dct: <http://purl.org/dc/terms/> 
			SELECT ?class (count(distinct ?uri) as ?count)
			WHERE	{ 
				?uri a ?class .
			}
			GROUP BY ?class`

			try {
				const result = await fetch(
					`${WAB_API}${encodeURIComponent(
						query,
					)}&output=json`,
				).then((res: any) => res.json())

				const t =
					result.results.bindings.map((row: any) => {
						return {
							[row.class.value]: row.count.value
						}
					}).reduce((acc: any, obj: any) => ({ ...acc, ...obj }), {})

				return t

			} catch (error) {
				this.logger.warn(error)
			}
		},
		async listWabBemerkung(page = 0, limit = 100) {
			const query = `
			PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
			PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
			PREFIX ws: <http://purl.org/wittgensteinsource/ont/>
			PREFIX dct: <http://purl.org/dc/terms/> 
			CONSTRUCT {
				?uri dct:identifier ?uri .
			} WHERE { 
				SELECT DISTINCT ?uri WHERE 
					{ 
						VALUES ?class { ws:Bemerkung ws:DiaryEntry ws:Correspondence ws:Recollection ws:LectureNotes ws:MS ws:TS }
						?uri a ?class .
					}
				ORDER BY ?uri
				OFFSET ${(page * limit)}
				LIMIT ${limit}
			}`

			const result = await fetch(
				`${WAB_API}${encodeURIComponent(
					query,
				)}&output=json`,
			).then((res: any) => res.json())

			if (isObjectEmpty(result)) {
				return []
			}

			const data = result['@graph'].map((item: any) => {
				item.id = item['@id']
					.replace('base:', "http://purl.org/wittgensteinsource/ont/")
					.replace('inst:', "http://purl.org/wittgensteinsource/ont/instances/")
					.replace('wgs:', "http://wittgensteinsource.org/")
				item.url = item['@id']
				delete item['dct:identifier']['@value']
				delete item['dct:identifier']
				delete item['@id']
				return item
			})

			return data
		},
		async getWabBemerkung(id) {
			// this.logger.info(`Fetching WAB Bemerkung ${id}`)
			const query = `
			PREFIX scho: <http://purl.org/wittgensteinsource/ont/scholar/0.1/>
			PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
			PREFIX owl: <http://www.w3.org/2002/07/owl#>
			PREFIX apf: <http://jena.hpl.hp.com/ARQ/property#>
			PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
			PREFIX fn: <http://www.w3.org/2005/xpath-functions#>
			PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
			PREFIX ws: <http://purl.org/wittgensteinsource/ont/>
			PREFIX dc: <http://purl.org/dc/elements/1.1/>
			PREFIX ubbont: <http://data.ub.uib.no/ontology/> 
			CONSTRUCT { 
				?subject a ?class .
				?subject rdfs:label ?label .
				?subject ubbont:type ?classLabel .
				?subject ubbont:existsContainsWord ?existsContainsWord .
				?subject ws:variant ?variant .
				?subject ws:dateString ?date .
				?subject ws:created ?created .
				?subject ws:madeBefore ?madeBefore .
				?subject ws:madeAfter ?madeAfter .
				?subject ws:dateSort ?dateSort .
				?subject ws:publishedIn ?publishedIn .
				?subject ws:publishedIn ?publishedIn2 .
				?subject ws:discusses ?discussedIn .
				?subject ws:subject ?discussedIn .
				?subject ws:refersToPerson ?refersToPerson .
				?subject ws:refersToWork ?refersToWork .
				?subject ws:hasPart ?hasPart .
				?subject ws:hasFacsView ?facsView .
				?subject ws:hasHtmlView ?htmlView .
				?subject ws:publishedInPart ?partLabel .
				?subject ws:receiver ?receiver .
				?subject ws:hasLanguage ?language .
				?subject ws:textGenre ?textGenre .
				?subject ws:sender ?sender .
			}
			WHERE {
				VALUES ?subject {<${id}>}
				?subject rdf:type ?class .
				?class rdfs:label ?classLabel .
				?subject rdfs:label ?label0.
				BIND(str(?label0) AS ?label)
				BIND (exists{?subject ws:containsWord ?word } AS ?existsContainsWord )
				OPTIONAL { ?subject ws:contains/rdfs:label ?textGenre }
				OPTIONAL { ?subject ws:language/rdfs:label ?language }
				OPTIONAL { ?subject ws:hasFacsView ?facsView }
				OPTIONAL { ?subject ^ws:isDateOf/rdfs:label ?date . }
				OPTIONAL { ?subject ^ws:hasPart/rdfs:label ?hasPart . }
				OPTIONAL { ?subject ^ws:isDiscussedIn/rdfs:label ?discussedIn . }
				OPTIONAL { 
					?subject ws:created ?created0 
					BIND(str(?created0) AS ?created)
				}
				OPTIONAL { 
					?subject ws:madeBefore ?madeBefore0 
					BIND(str(?madeBefore0) AS ?madeBefore)
				}
				OPTIONAL { 
					?subject ws:madeAfter ?madeAfter0 
					BIND(str(?madeAfter0) AS ?madeAfter)
				}
				BIND(coalesce(?created, ?madeAfter, ?madeBefore) AS ?dateSort)
				OPTIONAL { 
					?subject ws:sender/rdfs:label ?sender .
					?subject ws:receiver/rdfs:label ?receiver .
				}
				OPTIONAL { 
					#both facs and html view are generated from the ab xml:id, so both views always exists
					?subject  ws:hasHtmlView  ?htmlView ;
						ws:hasFacsView|(ws:isPartOf/ws:hasFacsView) ?facsView .
				}
				OPTIONAL{ 
					?subject ^ws:isWorkPublishedFrom ?publishedIn0 .
					?publishedIn0	rdf:type ws:Werk .
					?publishedIn0	rdfs:label ?publishedIn .
				}
				OPTIONAL { 
					?subject ^ws:isReferredToIn ?refersToPerson0 .
					?refersToPerson0 rdf:type scho:Person .
					?refersToPerson0 rdfs:label ?refersToPerson .
				}
				OPTIONAL { 
					?subject ws:isPublishedInWork ?publishedInPart0 .
					?publishedInPart0 rdf:type ws:Part ;
						ws:isPartOf ?publishedInWork0 ;
						rdfs:label ?partLabel .
					?publishedInWork0 rdf:type ws:Werk ;
						rdfs:label ?publishedIn2
				}
				# This adds 2 secs
				OPTIONAL { 
					?subject ^ws:isReferredToIn ?refersToWork0 .
					?refersToWork0 rdf:type ws:WittgensteinExternalSource .
					?refersToWork0 rdfs:label ?refersToWork .
				}
				OPTIONAL { 
					?subject ws:variant ?variant0 .
					?date1 ws:isDateOf ?variant0 ;
						rdfs:label ?variantDateLabel .
					?variant0 rdfs:label ?variantLabel
					BIND(concat("label::", str(?variantLabel), ";;", "date::", ?variantDateLabel) AS ?variant)
				}
			}`

			try {
				const results = await fetch(
					`${WAB_API}${encodeURIComponent(
						query
					)}&output=json`).then((res: any) => res.json());

				// Expand and compact the results using the legacy context
				const expanded = await jsonld.expand(results)
				const compacted = await jsonld.compact(expanded, wabLegacyContext)
				delete compacted["@context"]

				if (compacted['http://data.ub.uib.no/ontology/existsContainsWord' ?? 'existsContainsWord']) {
					const describe = await this.describeWabBemerkung(id);

					compacted.containsWord = describe.containsWord
					delete compacted['http://data.ub.uib.no/ontology/existsContainsWord' ?? 'existsContainsWord']
				}

				// Recreate ES suggest prop from the graph
				const label = compacted.label
					? Array.isArray(compacted.label) ? compacted.label : [compacted.label]
					: []
				const type = compacted.type
					? Array.isArray(compacted.type) ? compacted.type : [compacted.type]
					: []

				const array = [
					...type,
					...label,
				].map((item: any) => item.toLowerCase())

				const withSuggest = {
					...compacted,
					suggest: {
						input: array,
					}
				}

				return withSuggest;
			} catch (error) {
				this.logger.error(error)
				return error;
			}
		},
		async describeWabBemerkung(id) {
			// this.logger.info(`Describing WAB Bemerkung ${id}`)
			try {
				const results = await fetch(
					`${WAB_API}${encodeURIComponent(
						`describe <${id}>`
					)}&output=json`).then((res: any) => res.json());

				// Expand and compact the results using the legacy context
				const expanded = await jsonld.expand(results)
				const compacted = await jsonld.compact(expanded, wabLegacyContext)
				delete compacted["@context"]

				return compacted;
			} catch (error) {
				this.logger.error(error)
				return error;
			}
		},
	},

	/**
	 * Service created lifecycle event handler
	 */
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	created(this: LegacyThis) { },

	/**
	 * Service started lifecycle event handler
	 */
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	async started(this: LegacyThis) { },

	/**
	 * Service stopped lifecycle event handler
	 */
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	async stopped(this: LegacyThis) { },
};

export default LegacyService;
