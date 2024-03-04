import client from '../../libs/esClient';

export async function turnOffRefreshInterval(indexName: string) {
  try {
    // @ts-ignore
    await client.indices.putSettings({
      index: indexName,
      body: {
        "index.refresh_interval": "-1"
      }
    });
    console.log("The refresh interval was turned off for the duration of the indexing process.");
  } catch (error) {
    console.error("There was an error turning off the refresh interval. Continuing anyway...");
  }
}

export async function turnOnRefreshInterval(indexName: string) {
  try {
    // @ts-ignore
    await client.indices.putSettings({
      index: indexName,
      body: {
        "index.refresh_interval": "1s"
      }
    });
    console.log("The refresh interval was turned on.");
  } catch (error) {
    console.error(error);
  }
}