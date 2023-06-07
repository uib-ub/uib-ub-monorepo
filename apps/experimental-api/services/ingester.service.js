"use strict";

// const performIndexing = import("./ingester.mjs");
//import { performIndexing } from './indexing.js';
const { performIndexing } = require('./ingester.js');

/**
 * @typedef {import('moleculer').ServiceSchema} ServiceSchema Moleculer's Service Schema
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

/** @type {ServiceSchema} */
module.exports = {
	name: "ingester",

	/**
	 * Settings
	 */
	settings: {

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
				const { index, page = 0, limit } = ctx.params;
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
	events: {

	},

	/**
	 * Methods
	 */
	methods: {

	},

	/**
	 * Service created lifecycle event handler
	 */
	created() {

	},

	/**
	 * Service started lifecycle event handler
	 */
	async started() {

	},

	/**
	 * Service stopped lifecycle event handler
	 */
	async stopped() {

	}
};
