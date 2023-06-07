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
	name: "resolver",

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

		resolve: {
			rest: "POST /resolve",
			params: {
				id: "string"
			},
			timeout: 2000,
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
	events: {

	},

	/**
	 * Methods
	 */
	methods: {
		async resolveId(id) {
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

			const askMarcus = await fetch(`${process.env.MARCUS_API}${query}`).then(res => res.json()).then(res => {
				if (res.boolean) {
					return {
						name: 'marcus',
						url: process.env.MARCUS_API,
					}
				}
			})
			const askSka = await fetch(`${process.env.SKA_API}${query}`).then(res => res.json()).then(res => {
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
				]).then(res => res.filter(Boolean)[0])

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
