import { apiFetch as fetch } from "./helpers/fetch";
import { performance } from "perf_hooks";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { esClient } from "./helpers/es-client";
import { API_URL } from './constants';

/**
 * Get ids from the API
 * @deprecated 
 * @param {Number} page - Page number to fetch
 * @param {Number} limit - Number of items per page
 * @returns {Promise} Array of objects with id and identifier
 */
const getIds = async (page: number, limit: number) => {
	const response = await fetch(`${API_URL}/api/items?page=${page}&limit=${limit}`);
	const data = await response.json();
	return data;
};

/**
 * Resolve the ids from the API and return the data
 * @deprecated 
 * @param {Array} data - Array of objects containing ids
 * @returns {Array} Array of resolved objects
 */
const resolveIds = async (data: any) => {
	const promises = data.map((item: { id: string, url: string }) => fetch(`${API_URL}/api/items/${item.id}`));
	const responses = await Promise.all(promises);
	const results = await Promise.all(responses.filter(response => response.ok).map(response => response.json()));
	return results;
};

/**
 * Prepare data for bulk indexing
 * @deprecated 
 * @param {Array} data - Array of objects to be indexed
 * @param {String} indexName - Name of the Elasticsearch index
 * @returns {Array} Array of objects prepared for bulk indexing
 */
const prepareData = async (data: any, indexName: string) => {
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
	// console.log("🚀 ~ file: ingester.js:67 ~ prepareData ~ body:", body)
	return body;
};

/**
 * Bulk index the data
 * @deprecated 
 * @param {Array} data - Array of objects to be indexed
 * @param {string} indexName - Name of the Elasticsearch index
 * @returns {number} Number of items indexed
 */
const indexData = async (data: any, indexName: string) => {
	if (data.length === 0) return 0;
	// console.log("🚀 ~ file: ingester.js:78 ~ indexData ~ data:", data)
	try {
		// @ts-ignore
		const response = await esClient.bulk({
			refresh: true,
			body: data,
			pipeline: indexName
		});
		// console.log("🚀 ~ file: ingester.js:86 ~ indexData ~ response:", JSON.stringify(response.errors, null, 2))
		return response.items.length;
	}
	catch (error) {
		console.log("🚀 ~ file: ingester.js:96 ~ indexData ~ error", error)
	}

};

/**
 * Check if the index exists
 * @deprecated 
 * @param {string} index - Name of the index to check
 * @returns {Promise} Error message if the index does not exist
 */
export const checkIndexExists = async (index: string) => {
	// @ts-ignore
	const indexExists = await esClient.indices.exists({
		index: index
	});
	//console.log("🚀 ~ file: ingester.js:100 ~ checkIndexExists ~ indexExists:", indexExists)

	if (!indexExists) {
		return {
			error: `The index "${index}" does not exist. Please create it first.`
		};
	}
	return null;
};

/**
 * Turn off the refresh interval for the duration of the indexing process
 * @deprecated
 * @param {string} index - Name of the index
 * @returns {Promise} Result of the request
 */
const turnOffRefreshInterval = async (indexName: string) => {
	try {
		// @ts-ignore
		const result = await esClient.indices.putSettings({
			index: indexName,
			body: {
				"index.refresh_interval": "-1"
			}
		});
		console.log("The refresh interval was turned off for the duration of the indexing process.");
	} catch (error) {
		console.error("There was an error turning off the refresh interval. Continuing anyway...");
	}
};

/**
 * Turn on the refresh interval after the indexing process
 * @deprecated
 * @param {string} index - Name of the index
 * @returns {Promise} Result of the request
 */
const turnOnRefreshInterval = async (indexName: string) => {
	try {
		// @ts-ignore
		const result = await esClient.indices.putSettings({
			index: indexName,
			body: {
				"index.refresh_interval": "1s"
			}
		});
		console.log("The refresh interval was turned on.");
	} catch (error) {
		console.error(error);
	}
};


/**
 * Function to perform the indexing process
 * @deprecated
 * @param {string} index - Name of the index to use
 * @param {number} page - Page number to start with
 * @returns {Object} Object containing indexing summary
 */
export const performIndexing = async (index: string, source: string, page: number, limit: number) => {
	const indexCheckError = await checkIndexExists(index);

	if (indexCheckError) {
		return {
			error: indexCheckError.error
		};
	}

	await turnOffRefreshInterval(index);
	let currentPage = page;
	let total = 0;
	let totalIndexed = 0;
	let totalRuntime = 0;

	while (total < limit) {
		const t0 = performance.now();
		const ids = await getIds(currentPage, 100);
		const idCount = ids.length;
		total += idCount;

		if (idCount < 100) {
			break;
		}

		if (!ids.length) {
			break;
		}

		const resolved = await resolveIds(ids);
		const preparedData = await prepareData(resolved, index);
		const count = await indexData(preparedData, index) ?? 0;
		console.log("🚀 ~ file: ingester.js:175 ~ performIndexing ~ count:", count)
		const t1 = performance.now();
		const took = t1 - t0;
		console.log(`Indexed ${count} items in ${took} milliseconds. Total: ${totalIndexed + count} of ${total} ids. Page: ${currentPage}`);

		totalIndexed += count;
		currentPage += 1;
		totalRuntime += took;
	}

	const minutes = Math.floor(totalRuntime / 60000);
	const seconds = ((totalRuntime % 60000) / 1000).toFixed(0);

	console.log(`Indexed ${totalIndexed} items of ${total} ids in total into "${index}". It took ${minutes}:${seconds} minutes.`);
	await turnOnRefreshInterval(index);

	return {
		index: index,
		ingested: totalIndexed,
		errors: total - totalIndexed,
		timeTaken: `${minutes}:${seconds} minutes`
	};
};

module.exports = {
	performIndexing
};
