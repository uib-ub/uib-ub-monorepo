const dotenv = require("dotenv");
const fetch = require("node-fetch-retry");
const { performance } = require("perf_hooks");
const { Client } = require("@elastic/elasticsearch");
const { Transport } = require("@elastic/transport");

dotenv.config();

class MTransport extends Transport {
	request(params, options, callback) {
		params.path = process.env.ES_PATH + params.path;
		return super.request(params, options, callback);
	}
}

const client = new Client({
	node: process.env.ES_HOST,
	Transport: MTransport,
	auth: {
		apiKey: process.env.ES_APIKEY
	}
});

/**
 * Get ids from the API
 * @param {number} page - Page number to fetch
 * @param {number} limit - Number of items per page
 * @returns {Promise} Array of objects with id and identifier
 */
const getIds = async (page, limit) => {
	const API = process.env.NODE_ENV === "production" ? "https://api-ub.vercel.app" : "http://localhost:3009";
	const response = await fetch(`${API}/items?page=${page}&limit=${limit}`, { method: "GET", retry: 3, pause: 500 });
	const data = await response.json();
	return data;
};

/**
 * Resolve the ids from the API and return the data
 * @param {Array} data - Array of objects containing ids
 * @returns {Array} Array of resolved objects
 */
const resolveIds = async (data) => {
	const promises = data.map(item => fetch(`${item.id}?context=es`, { method: "GET", retry: 10, pause: 300 }));
	const responses = await Promise.all(promises);
	const results = await Promise.all(responses.filter(response => response.ok).map(response => response.json()));
	return results;
};

/**
 * Prepare data for bulk indexing
 * @param {Array} data - Array of objects to be indexed
 * @param {string} indexName - Name of the Elasticsearch index
 * @returns {Array} Array of objects prepared for bulk indexing
 */
const prepareData = (data, indexName) => {
	// create an array of index objects with the id
	const items = data.map(({ id }) => ({
		index: {
			_index: indexName,
			_id: id
		}
	}));

	// create an array of objects with the id and the data
	const body = items.flatMap((item, i) => [item, data[i]]);
	return body;
};

/**
 * Bulk index the data
 * @param {Array} data - Array of objects to be indexed
 * @param {string} indexName - Name of the Elasticsearch index
 * @returns {number} Number of items indexed
 */
const indexData = async (data, indexName) => {
	if (data.length === 0) return 0;
	const response = await client.bulk({
		refresh: true,
		body: data,
		pipeline: indexName
	});

	return response.items.length;
};

/**
 * Function to perform the indexing process
 * @param {string} index - Name of the index to use
 * @param {number} page - Page number to start with
 * @returns {Object} Object containing indexing summary
 */
const performIndexing = async (index, page, limit) => {
	const checkIndexExists = async (index) => {
		const indexExists = await client.indices.exists({
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

	const turnOffRefreshInterval = async (indexName) => {
		try {
			const result = await client.indices.putSettings({
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

	const turnOnRefreshInterval = async (indexName) => {
		try {
			const result = await client.indices.putSettings({
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
		const preparedData = prepareData(resolved, index);
		const count = await indexData(preparedData, index);
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
		totalIndexed: totalIndexed,
		totalIds: total,
		timeTaken: `${minutes}:${seconds} minutes`
	};
};

module.exports = {
	performIndexing
};
