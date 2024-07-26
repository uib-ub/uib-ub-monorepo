export const runtime = 'edge'

import { extractFacets } from '../_utils/facets'
import { getQueryString } from '../_utils/query-string';
import { postQuery } from '../_utils/post';

// Configuration loader function
async function loadConfigForDataset(dataset: string) {
  try {
      // Dynamically import the configuration based on the dataset
      // Adjust the path as necessary to point to where your configurations are stored
      const configModule = await import(`@/config/datasets/${dataset}.ts`);
      return configModule.default; // Assuming each module exports its configuration as default
  } catch (error) {
      console.error(`Failed to load configuration for dataset ${dataset}:`, error);
      // Handle missing configuration as appropriate
      return { error: `Configuration for dataset ${dataset} not found` };
  }
}

export async function GET(request: Request) {
  const {termFilters, filteredParams} = extractFacets(request)
  const dataset = filteredParams.dataset // == 'search' ? '*' : filteredParams.dataset;
  const { highlight, simple_query_string } = getQueryString(filteredParams)

  let sortArray = []

  const datasetConfig = await loadConfigForDataset(dataset)

  console.log(datasetConfig)

  
  if (filteredParams.display == 'table') {
    if (filteredParams.asc) {
      sortArray.push({[filteredParams.asc]: 'asc'})
    }
    if (filteredParams.desc) {
      sortArray.push({[filteredParams.desc]: 'desc'})
    }
  }
  else {
    sortArray = datasetConfig.defaultSort
  }
    
  const query: Record<string,any> = {
    "from": filteredParams.page ? (parseInt(filteredParams.page) - 1) * parseInt(filteredParams.size || '10') : 0,
    "size": filteredParams.size  || 10,
    ...highlight ? {highlight} : {},
    "aggs": {
      "viewport": {
        "geo_bounds": {
          "field": "location",
          "wrap_longitude": true
        },

      }
    },
    "sort": sortArray
  }

  if (simple_query_string && termFilters.length) {
    query.query = {
      "bool": {
        "must": simple_query_string,              
        "filter": termFilters
      }
    }
  }
  else if (simple_query_string) {
    query.query = simple_query_string
  }
  else if (termFilters.length) {
    query.query = {"bool": {
        "filter": termFilters
      }
    }
  }

  const data = await postQuery(dataset, query)

  return Response.json(data);
}