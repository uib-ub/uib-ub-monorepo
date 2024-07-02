import { IlmPutLifecycleRequest } from '@elastic/elasticsearch/lib/api/types';

export const logLifecyclePolicies: IlmPutLifecycleRequest = {
  "name": "log-lifecycle-policy",
  "policy": {
    "_meta": {
      "description": "used for chc logs"
    },
    "phases": {
      "hot": {
        "actions": {
          "rollover": {
            "max_primary_shard_size": "10gb"
          }
        }
      },
      "warm": {
        "min_age": "7d",
        "actions": {
          "shrink": {
            "number_of_shards": 1
          },
          "forcemerge": {
            "max_num_segments": 1
          }
        }
      },
      "cold": {
        "min_age": "14d",
        "actions": {}
      },
      "delete": {
        "min_age": "30d",
        "actions": {
          "delete": {}
        }
      }
    }
  },
}