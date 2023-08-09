export interface BulkIndexResponse {
  took: number;
  ingest_took: number;
  errors: boolean;
  items: Item[];
}

export interface Item {
  index: Index;
}

export interface Index {
  _index: string;
  _id: string;
  _version: number;
  result: string;
  forced_refresh: boolean;
  _shards: Shards;
  _seq_no: number;
  _primary_term: number;
  status: number;
  error?: Error;
}
export interface Error {
  type: string;
  reason: string;
}

export interface Shards {
  total: number;
  successful: number;
  failed: number;
}

export interface IndexDataResponse {
  count: number;
  errors: string[];
}