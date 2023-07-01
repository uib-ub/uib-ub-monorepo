import type { Context, Service, ServiceSchema } from "moleculer";
import { performIndexing } from '../lib/ingester';

export interface ActionHelloParams {
	name: string;
}

interface IngesterSettings {
	defaultName: string;
}

interface IngesterMethods {
	uppercase(str: string): string;
}

interface IngesterLocalVars {
	myVar: string;
}

type IngesterThis = Service<IngesterSettings> & IngesterMethods & IngesterLocalVars;

const IngesterService: ServiceSchema<IngesterSettings> = {
	name: "ingester",

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

		ingest: {
			rest: "POST /ingest",
			params: {
				index: "string",
				page: {
					type: "number",
					optional: true
				},
				limit: {
					type: "number",
					optional: true
				}
			},
			timeout: 0,
			retries: 0,
			visibility: "published",
			/** @param {Context} ctx  */
			async handler(ctx) {
				const { index, page = 0, limit = Infinity } = ctx.params;
				try {
					const data = await performIndexing(index, page, limit);
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

	},

	/**
	 * Service created lifecycle event handler
	 */
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	created(this: IngesterThis) { },

	/**
	 * Service started lifecycle event handler
	 */
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	async started(this: IngesterThis) { },

	/**
	 * Service stopped lifecycle event handler
	 */
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	async stopped(this: IngesterThis) { },
};

export default IngesterService;
