import { BulkIndexResponse, IndexDataResponse } from '../types';
import type { Service, ServiceSchema } from "moleculer";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { esClient } from '../lib/helpers/es-client';
import { pipelines } from '../lib/es/pipelines';
import { mappings } from '../lib/es/mappings';
import { settings } from '../lib/es/settings';
import { resolvePromisesSeq } from '../lib/helpers/resolvePromisesSeq';
import { json } from 'stream/consumers';

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
		 * @param {String} source - Source of data
		 * @param {Number} page - Starting page
		 * @param {Number} limit - Limit
		 */
		prepare: {
			rest: "POST /prepare",
			params: {
				index: "string",
			},
			timeout: 0,
			retries: 0,
			visibility: "published",
			/** @param {Context} ctx  */
			async handler(ctx) {
				const { index } = ctx.params;
				const response = await this.prepareIndex(index);

				return response
			}
		},
		ingest: {
			rest: "POST /ingest",
			params: {
				index: "string",
				source: {
					type: "enum",
					values: ["marcus-demo", "ska2", "marcus-prod", "wab"]
				},
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
				const { index, source, page = 0, limit = 100 } = ctx.params;
				// @ts-ignore
				const indexExists = await esClient.indices.exists({
					index: index
				});

				if (!indexExists) {
					return {
						error: `The index "${index}" does not exist. Please create it first.`
					};
				}

				switch (source) {
					case "marcus-demo":
						try {
							// Turn off refreshInterval for a supposed speed bump
							await this.turnOffRefreshInterval(index);

							// Set initial values
							let currentPage = page;
							let totalFetched = 0;
							let totalIndexed = 0;
							let totalRuntime = 0;
							let errors: any[] = []

							while (true) {
								// Sample time for fetch and index step
								const t0 = performance.now();
								const ids = await this.getItems(currentPage, limit);
								totalFetched += ids.length;

								if (ids.length === 0) {
									break;
								}

								try {
									const resolved = await this.resolveIds(ids);
									const preparedData = this.prepareData(resolved, index);
									const indexStatus = await this.indexData(preparedData, index) ?? 0;

									const took = performance.now() - t0;
									totalIndexed += indexStatus.count;
									currentPage += 1;
									totalRuntime += took;

									errors.push(...indexStatus.errors);

									this.logger.info(`Indexed ${indexStatus.count} items in ${took} milliseconds. Total: ${totalIndexed} of ${totalFetched} ids. Page: ${currentPage}`);
								} catch (iterationError) {
									this.logger.error("Error in loop iteration:", iterationError);
									// Decide whether to continue the loop or break here
								}
							}

							const minutes = Math.floor(totalRuntime / 60000);
							const seconds = ((totalRuntime % 60000) / 1000).toFixed(0);

							await this.turnOnRefreshInterval(index);

							this.logger.info(`Indexed ${totalIndexed} items of ${totalFetched} ids in total into "${index}" from the source "${source}". It took ${minutes}:${seconds} minutes.`);

							ctx.meta.$statusCode = 200

							return {
								index,
								source,
								timeTaken: `${minutes}:${seconds} minutes`,
								ingested: totalIndexed,
								...(errors.length && { errors: errors }),
							};

						} catch (error) {
							ctx.meta.$statusCode = 400
							return error
						}
					case "wab":
						try {
							// Turn off refreshInterval for a supposed speed bump
							await this.turnOffRefreshInterval(index);

							// Set initial values
							let currentPage = page;
							let totalFetched = 0;
							let totalIndexed = 0;
							let totalRuntime = 0;
							let errors: any[] = []

							while (true) {
								// Sample time for fetch and index step
								const t0 = performance.now();
								const ids = await this.getWabItems(currentPage, limit);
								totalFetched += ids.length;

								// Break if there are no more ids to fetch
								if (ids.length === 0) {
									break;
								}
								try {
									const resolved = await this.resolveWabIds(ids);
									const preparedData = this.prepareData(resolved, index);
									const indexStatus = await this.indexData(preparedData, index);

									const took = performance.now() - t0;
									totalIndexed += indexStatus.count;
									currentPage += 1;
									totalRuntime += took;

									errors.push(...indexStatus.errors);

									this.logger.info(`Indexed ${indexStatus.count} items in ${took} milliseconds. Total: ${totalIndexed} of ${totalFetched} ids. Page: ${currentPage}`);
								} catch (iterationError) {
									this.logger.error("Error in loop iteration:", iterationError);
									// Decide whether to continue the loop or break here
								}
							}
							// Convert totalRuntime to something human-readable
							const minutes = Math.floor(totalRuntime / 60000);
							const seconds = ((totalRuntime % 60000) / 1000).toFixed(0);

							// Turn on refreshInterval
							await this.turnOnRefreshInterval(index);

							this.logger.info(`Indexed ${totalIndexed} items of ${totalFetched} ids in total into "${index}" from the source "${source}". It took ${minutes}:${seconds} minutes.`);

							ctx.meta.$statusCode = 200

							return {
								index,
								source,
								timeTaken: `${minutes}:${seconds} minutes`,
								ingested: totalIndexed,
								...(errors.length && { errors: errors }),
							};

						} catch (error) {
							ctx.meta.$statusCode = 400

							return {
								page,
								error
							}
						}
					case "ska2":
						try {
							await this.turnOffRefreshInterval(index);
							let agentsReport = {}
							let documentsReport = {}
							let topicsReport = {}

							const agents: any = await this.broker.call('legacy.getLegacySkaAgents');
							if (agents.length > 0) {
								const chunkedAgents: any = this.chunk(agents, 1000);
								agentsReport = await chunkedAgents.reduce(async (accPromise: IndexDataResponse, data: any[]) => {
									const acc = await accPromise; // Resolve the accumulator promise
									const preparedAgents = this.prepareData(data, index);
									const result = await this.indexData(preparedAgents, index);
									return {
										count: acc.count + result.count,
										errors: [
											...acc.errors,
											...result.errors
										]
									};
								}, Promise.resolve({ count: 0, errors: [] }));
							}

							const documents: any = await this.broker.call('legacy.getLegacySkaDocuments');
							if (documents.length > 0) {
								const chunkedDocuments: any = this.chunk(documents, 1000);
								documentsReport = await chunkedDocuments.reduce(async (accPromise: IndexDataResponse, data: any[]) => {
									const acc = await accPromise; // Resolve the accumulator promise
									const preparedDocuments = this.prepareData(data, index);
									const result = await this.indexData(preparedDocuments, index);
									return {
										count: acc.count + result.count,
										errors: [
											...acc.errors,
											...result.errors
										]
									};
								}, Promise.resolve({ count: 0, errors: [] }));
							}

							const topics: any = await this.broker.call('legacy.getLegacySkaTopics');
							if (topics.length > 0) {
								const chunkedTopics: any = this.chunk(topics, 1000);
								topicsReport = await chunkedTopics.reduce(async (accPromise: IndexDataResponse, data: any[]) => {
									const acc = await accPromise; // Resolve the accumulator promise
									const preparedTopics = this.prepareData(data, index);
									const result = await this.indexData(preparedTopics, index);
									return {
										count: acc.count + result.count,
										errors: [
											...acc.errors,
											...result.errors
										]
									};
								}, Promise.resolve({ count: 0, errors: [] }));
							}


							await this.turnOnRefreshInterval(index);
							return {
								agents: agentsReport,
								documents: documentsReport,
								topics: topicsReport,
							}

						} catch (error) {
							ctx.meta.$statusCode = 400
							return {
								page,
								error
							}
						}
					default:
						ctx.meta.$statusCode = 400
						return "Invalid source"
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
		getItems(page: number, limit: number) {
			const data: any = this.broker.call("items.list", { page: page, limit: limit });
			return data;
		},
		getWabItems(page: number, limit: number) {
			const data: any = this.broker.call("legacy.listLegacyWabBemerkung", { page: page, limit: limit });
			return data;
		},
		chunk(array: any[], size: number) {
			const chunked_arr: any[] = [];
			let index = 0;
			while (index < array.length) {
				chunked_arr.push(array.slice(index, size + index));
				index += size;
			}
			return chunked_arr;
		},
		async resolveIds(ids: any) {
			const promises = ids.map((item: { id: string, url: string }) => this.broker.call("items.get", { id: item.id }))
			const data = await Promise.all(promises);
			return data;
		},
		async resolveWabIds(ids: any) {
			//console.log("🚀 ~ file: ingester.service.ts:283 ~ resolveWabIds ~ ids:", ids)
			const promises = ids.map((item: { id: string, url: string }) => this.broker.call("legacy.getLegacyWabBemerkung", { id: item.id }))
			const data = await Promise.all(promises);
			return data;
		},
		prepareData(data: any, indexName: string) {
			//console.log("🚀 ~ file: ingester.js:55 ~ prepareData ~ data:", data)
			// create an array of index objects with the id
			const items = data.map(({ id }: { id: string }) => ({
				index: {
					_index: indexName,
					_id: id
				}
			}));

			// create an array of objects with the id and the data
			const body = items.flatMap((item: any, i: number) => [item, data[i]]);
			//console.log("🚀 ~ file: ingester.js:67 ~ prepareData ~ body:", body)
			return body;
		},
		async indexData(data: any, indexName: string) {
			if (data.length === 0) return `No data to ingest into ${indexName}`;
			//console.log("🚀 ~ file: ingester.service.ts:305 ~ indexData ~ data:", data)

			try {
				// @ts-ignore
				const response: BulkIndexResponse = await esClient.bulk({
					refresh: true,
					body: data,
					pipeline: indexName
				});

				const errors = response.items.filter((item) => item.index.error).map((item) => {
					return `Error indexing item ${item.index._id}: ${JSON.stringify(item.index.error)}`;
				})

				if (errors.length > 0) this.logger.warn(errors)

				return {
					count: response.items.length,
					errors: errors ?? []
				}
			}
			catch (error) {
				this.logger.warn("🚀 ~ file: ingester.js:96 ~ indexData ~ error", error)
			}
		},
		async turnOffRefreshInterval(indexName: string) {
			try {
				// @ts-ignore
				await esClient.indices.putSettings({
					index: indexName,
					body: {
						"index.refresh_interval": "-1"
					}
				});
				console.log("The refresh interval was turned off for the duration of the indexing process.");
			} catch (error) {
				console.error("There was an error turning off the refresh interval. Continuing anyway...");
			}
		},
		async turnOnRefreshInterval(indexName: string) {
			try {
				// @ts-ignore
				await esClient.indices.putSettings({
					index: indexName,
					body: {
						"index.refresh_interval": "1s"
					}
				});
				console.log("The refresh interval was turned on.");
			} catch (error) {
				console.error(error);
			}
		},
		async prepareIndex(indexName: string) {
			const indexLowercased = indexName.replace('-', '_')
			// ts ignore because of the dynamic index name
			// @ts-ignore
			const PIPELINE = pipelines[indexLowercased]
			// @ts-ignore
			const MAPPING = mappings[indexLowercased]
			// @ts-ignore
			const SETTING = settings[indexLowercased]

			if (!PIPELINE || !MAPPING || !SETTING) {
				return {
					ok: false,
					message: 'Missing mappings, pipelines or settings for this index name, aborting.'
				}
			}

			this.logger.info("Calling Promise.allSettled")
			try {
				/* @ts-ignore */
				const deleteIndex = await esClient.indices.delete({ index: indexName, ignore_unavailable: true }, function (err) {
					if (err) {
						throw new Error(err)
					}
				}).then((res: any) => {
					return {
						operation: 'delete',
						res
					}
				}).catch((err: any) => {
					return err
				})

				/* @ts-ignore */
				const createIndex = await esClient.indices.create({ index: indexName, body: SETTING }, function (err) {
					if (err) {
						throw new Error(err)
					}
				}).then((res: any) => {
					return {
						operation: 'create',
						res
					}
				}).catch((err: any) => {
					return err
				})

				/* @ts-ignore */
				const putPipeline = await esClient.ingest.putPipeline(PIPELINE, function (err) {
					if (err) {
						throw new Error(err)
					}
				}).then((res: any) => {
					return {
						operation: 'putPipeline',
						res
					}
				}).catch((err: any) => {
					return err
				})

				/* @ts-ignore */
				const putMapping = await esClient.indices.putMapping({ index: indexName, body: MAPPING }, function (err) {
					if (err) {
						throw new Error(err)
					}
				}).then((res: any) => {
					return {
						operation: 'putMapping',
						res
					}
				}).catch((err: any) => {
					return err
				})

				return [
					deleteIndex,
					createIndex,
					putPipeline,
					putMapping,
				]
			} catch (err) {
				return err
			}
		}
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
