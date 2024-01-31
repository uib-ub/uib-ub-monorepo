export interface ResultData {
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