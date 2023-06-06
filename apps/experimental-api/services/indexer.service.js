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
	name: "indexer",

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
				page: undefined || "number",
				limit: undefined || "number"
			},
			timeout: -1,
			/** @param {Context} ctx  */
			async handler(ctx) {
				const { index, page, limit } = ctx.params;
				const data = await performIndexing(index, page, limit);
				if (data) {
					ctx.meta.$statusCode = 200
					return data
				}
				return ctx.meta.$statusCode = 400
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
