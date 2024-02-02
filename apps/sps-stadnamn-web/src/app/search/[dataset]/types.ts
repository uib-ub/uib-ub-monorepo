
export interface Hits {
  total: {
    value: number;
  };
  hits: Array<{
    _id: string;
    _source: {
      label: string;
      rawData: {
        kommuneNamn: string;
      };
    };
  }>;
}


export interface ResultData {
    total: {
      value: number;
    };
    aggregations: {
      viewport: {
        bounds: {
          top_left: {
            lat: number;
            lon: number;
          };
          bottom_right: {
            lat: number;
            lon: number;
          };
        };
      };
      adm1: {
        buckets: Array<{
          key: string;
          doc_count: number;
          adm2: {
            buckets: Array<{
              key: string;
              doc_count: number;
            }>;
          };
        }>;
      };
    };
    hits: Hits;
  }