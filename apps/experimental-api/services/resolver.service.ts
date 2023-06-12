import type { Context, Service, ServiceSchema } from "moleculer";
import { apiFetch as fetch } from '../lib/fetch';

export interface ActionHelloParams {
	name: string;
}

interface ResolverSettings {
	defaultName: string;
}

interface ResolverMethods {
	uppercase(str: string): string;
}

interface ResolverLocalVars {
	myVar: string;
}

type ResolverThis = Service<ResolverSettings> & ResolverMethods & ResolverLocalVars;

const ResolverService: ServiceSchema<ResolverSettings> = {
	name: "resolver",

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
		resolve: {
			rest: "POST /resolve",
			params: {
				id: "string"
			},
			timeout: 20000,
			retries: 3,
			visibility: "published",
			/** @param {Context} ctx  */
			async handler(ctx) {
				const { id } = ctx.params;
				try {
					const data = await this.resolveId(id);

					if (data) {
						ctx.meta.$statusCode = 200
						return data
					}
				} catch (error) {
					ctx.meta.$statusCode = 400
					return error
				}
			}
		}
	},

	/**
	 * Events
	 */
	events: {},

	/**
	 * Methods
	 */
	methods: {
		async resolveId(id: string) {
			const query = `
				PREFIX dct: <http://purl.org/dc/terms/>
				ASK { 
					{ 
						VALUES ?id { "${id}" }
						?s dct:identifier ?id .
					}
					UNION
					{
						?s dct:identifier ?id .
						FILTER langMatches( lang(?id), "no" ) 
					}
					UNION
					{
						?s dct:identifier ?id .
						FILTER langMatches( lang(?id), "en" ) 
					}
				}      
			`

			const askMarcus = await fetch(`${process.env.MARCUS_API}${query}`).then((res: any) => res.json()).then((res: any) => {
				if (res.boolean) {
					return {
						name: 'marcus',
						url: process.env.MARCUS_API,
					}
				}
			})
			const askSka = await fetch(`${process.env.SKA_API}${query}`).then((res: any) => res.json()).then((res: any) => {
				if (res.boolean) {
					return {
						name: 'skeivtarkiv',
						url: process.env.SKA_API,
					}
				}
			})

			try {
				const response = await Promise.all([
					askMarcus,
					askSka,
				]).then((res: any) => res.filter(Boolean)[0])

				if (response) {
					return response
				} else {
					return { message: "ID not found in any services." }
				}
			} catch (err) {
				throw new Error('err')
			}
		}
	},

	/**
	 * Service created lifecycle event handler
	 */
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	created(this: ResolverThis) { },

	/**
	 * Service started lifecycle event handler
	 */
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	async started(this: ResolverThis) { },

	/**
	 * Service stopped lifecycle event handler
	 */
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	async stopped(this: ResolverThis) { },
};

export default ResolverService;
