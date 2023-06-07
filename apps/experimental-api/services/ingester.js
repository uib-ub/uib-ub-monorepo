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
 * @param {Number} page - Page number to fetch
 * @param {Number} limit - Number of items per page
 * @returns {Promise} Array of objects with id and identifier
 */
const getIds = async (page, limit) => {
	const response = await fetch(`http://0.0.0.0:3099/api/items?page=${page}&limit=${limit}`, { method: "GET", retry: 3, pause: 500 });
	const data = await response.json();
	return data;
};

/**
 * Resolve the ids from the API and return the data
 * @param {Array} data - Array of objects containing ids
 * @returns {Array} Array of resolved objects
 */
const resolveIds = async (data) => {
	const promises = data.map(item => fetch(`http://0.0.0.0:3099/api/items/${item.id}`, { method: "GET", retry: 5, pause: 1000 }));
	const responses = await Promise.all(promises);
	const results = await Promise.all(responses.filter(response => response.ok).map(response => response.json()));
	return results;
};

/**
 * Prepare data for bulk indexing
 * @param {Array} data - Array of objects to be indexed
 * @param {String} indexName - Name of the Elasticsearch index
 * @returns {Array} Array of objects prepared for bulk indexing
 */
const prepareData = async (data, indexName) => {
	//console.log("🚀 ~ file: ingester.js:55 ~ prepareData ~ data:", data)
	// create an array of index objects with the id

	const items = data.map(({ id }) => ({
		index: {
			_index: indexName,
			_id: id
		}
	}));

	// create an array of objects with the id and the data
	const body = items.flatMap((item, i) => [item, data[i]]);
	// console.log("🚀 ~ file: ingester.js:67 ~ prepareData ~ body:", body)
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
	console.log("🚀 ~ file: ingester.js:78 ~ indexData ~ data:", data)
	try {
		const response = await client.bulk({
			refresh: true,
			body: data,
			pipeline: indexName
		});
		console.log("🚀 ~ file: ingester.js:86 ~ indexData ~ response:", JSON.stringify(response, null, 2))
		return response.items.length;
	}
	catch (error) {
		console.log("🚀 ~ file: ingester.js:96 ~ indexData ~ error", error)
	}

};

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


/**
 * Function to perform the indexing process
 * @param {string} index - Name of the index to use
 * @param {number} page - Page number to start with
 * @returns {Object} Object containing indexing summary
 */
const performIndexing = async (index, page, limit) => {
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
		const count = await indexData(preparedData, index);
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
