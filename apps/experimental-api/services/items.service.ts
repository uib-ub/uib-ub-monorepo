import type { Context, Service, ServiceSchema } from "moleculer";
import { SPARQL_PREFIXES } from "../lib/constants";
import jsonld from "jsonld";
import { apiFetch as fetch } from "../lib/helpers/fetch";

export interface ActionHelloParams {
	name: string;
}

interface ItemsSettings {
	defaultName: string;
}

interface ItemsMethods {
	// uppercase(str: string): string;
}

interface ItemsLocalVars {
	myVar: string;
}

type ItemsThis = Service<ItemsSettings> & ItemsMethods & ItemsLocalVars;

const ItemsService: ServiceSchema<ItemsSettings> = {
	name: "items",

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
		/**
		 * Ingest Marcus data
		 *
		 * @param {String} index - Index name
		 * @param {Number} page - Starting page
		 * @param {Number} limit - Limit
		 */

		list: {
			cached: true,
			rest: "GET /",
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
					const data = await this.getItemsList(page, limit);

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
		get: {
			rest: "GET /:id",
			timeout: 10000,
			retries: 3,
			visibility: "published",
			/** @param {Context} ctx  */
			async handler(ctx) {
				const { id } = ctx.params;
				const service: { id: string, url: string } = await ctx.call("resolver.resolve", { id: id });
				try {
					const data = await this.getObjectData(id, service.url);

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
		async getItemsList(page = 0, limit = 100) {
			const url = 'https://sparql.ub.uib.no/sparql/query?query='

			const query = `
				${SPARQL_PREFIXES}
				CONSTRUCT {
					?uri dct:identifier ?id .
				} WHERE { 
					SELECT DISTINCT ?uri ?id WHERE 
						{ 
							?uri rdf:type/rdfs:subClassOf* bibo:Document ;
								dct:identifier ?id .
						}
					ORDER BY ?id
					OFFSET ${(page * limit)}
					LIMIT ${limit}
				}
			`

			const result = await fetch(
				`${url}${encodeURIComponent(
					query,
				)}&output=json`,
			).then((res: any) => res.json())

			delete result['@context']
			const data = result['@graph'].map((item: any) => {
				item.id = item['dct:identifier' ?? 'identifier']['@value'] ?? item['dct:identifier' ?? 'identifier']
				item.url = `https://api-ub.vercel.app/items/${item['dct:identifier' ?? 'identifier']['@value'] ?? item['dct:identifier' ?? 'identifier']}`
				delete item['dct:identifier']['@value']
				delete item['dct:identifier']
				delete item['@id']
				return item
			})

			return data
		},
		async getObjectData(id, url) {
			const query = `
				${SPARQL_PREFIXES}
				CONSTRUCT {
					?uri ?p ?o ;
						a crm:E22_Human-Made_Object ;
						rdfs:label ?label ;
						muna:image ?image ;
						muna:subjectOfManifest ?manifest ;
						foaf:homepage ?homepage .
					?o a ?oClass ;
						dct:identifier ?identifier ;
						rdfs:label ?oLabel ;
						wgs:long ?long ;
						wgs:lat ?lat .
				} WHERE { 
					VALUES ?id {"${id}"}
					?uri dct:identifier ?id ;
						?p ?o .
					OPTIONAL {?uri dct:title ?title } .
					OPTIONAL {?uri foaf:name ?name } .
					OPTIONAL {?uri skos:prefLabel ?prefLabel } .
					OPTIONAL {?uri rdfs:label ?rdfsLabel } .
					BIND (COALESCE(?title,?name,?prefLabel,?rdfsLabel) AS ?label) .
					# Get multipage image
					OPTIONAL { 
						?uri ubbont:hasRepresentation / dct:hasPart ?page .
						?page ubbont:sequenceNr 1 .
						?page ubbont:hasResource ?resource .
						OPTIONAL {?resource ubbont:hasSMView ?smImage.}  
						OPTIONAL {?resource ubbont:hasMDView ?mdImage.}
					}
					# Get singlepage image
					OPTIONAL { 
						?uri ubbont:hasRepresentation / dct:hasPart ?part .
						OPTIONAL {?part ubbont:hasMDView ?imgMD .}
						OPTIONAL {?part ubbont:hasSMView ?imgSM .} 
					}
					BIND (COALESCE(?imgMD,?imgSM,?mdImage,?smImage) AS ?image) .
					OPTIONAL {
						?o a ?oClass ;
							(dct:title|foaf:name|skos:prefLabel|rdfs:label) ?oLabel .
						OPTIONAL {?o dct:identifier ?identifier } .
						OPTIONAL {
							?o wgs:long ?long ;
								wgs:lat ?lat
						}
						FILTER(?oClass != rdfs:Class)
					}
					OPTIONAL { 
						?uri dct:license / rdfs:label ?licenseLabel .
					}
					BIND(iri(REPLACE(str(?uri), "data.ub.uib.no","marcus.uib.no","i")) as ?homepage) .
					BIND(CONCAT("https://api-ub.vercel.app/items/", ?id, "/manifest") as ?manifest) .
					FILTER(?p != ubbont:cataloguer && ?p != ubbont:internalNote)
				}
			`;

			try {
				const results = await fetch(
					`${url}${encodeURIComponent(
						query
					)}&output=json`).then((res: any) => res.json());

				// Frame the result for nested json
				const awaitFramed = jsonld.frame(results, {
					'@context': [`https://api-ub.vercel.app/ns/es/context.json`],
					'@type': 'HumanMadeObject',
					'@embed': '@always',
				});

				let framed = await awaitFramed

				// Change id as this did not work in the query
				framed.id = `https://api-ub.vercel.app/items/${framed.identifier}`
				// We assume all @none language tags are really norwegian
				framed = JSON.parse(JSON.stringify(framed).replaceAll('"none":', '"no":'))

				// framed.timespan = getTimespan(framed?.created, framed?.madeAfter, framed?.madeBefore)
				// delete framed?.madeAfter
				// delete framed?.madeBefore

				// @TODO: Remove this when we have dct:modified on all items in the dataset
				framed.modified = {
					"type": "xsd:date",
					"@value": framed.modified ?? "2020-01-01T00:00:00"
				}

				return framed;
			} catch (error) {
				return error;
			}
		}
	},

	/**
	 * Service created lifecycle event handler
	 */
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	created(this: ItemsThis) { },

	/**
	 * Service started lifecycle event handler
	 */
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	async started(this: ItemsThis) { },

	/**
	 * Service stopped lifecycle event handler
	 */
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	async stopped(this: ItemsThis) { },
};

export default ItemsService;
