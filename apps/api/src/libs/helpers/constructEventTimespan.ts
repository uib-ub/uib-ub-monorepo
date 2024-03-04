import { getTimespan } from './constructTimespan';
import { checkIntervalValidity } from './checkIntervalValidity';

export const constructEventTimespan = (data: any) => {
  return data.map((item: any) => {
    const {
      ['http://data.ub.uib.no/ontology/begin']: begin, ['http://data.ub.uib.no/ontology/end']: end,
    } = item;
    delete item['http://data.ub.uib.no/ontology/begin'];
    delete item['http://data.ub.uib.no/ontology/end'];

    let start = begin?.[0] ?? undefined;
    let ending = end?.[0] ?? undefined;
    if (start && end) {
      [start, ending] = checkIntervalValidity(start, ending);
    }
    const timespan = getTimespan(null, start, ending);

    if (!timespan) return item;
    return {
      ...item,
      timespan: timespan ?? undefined,
    };
  });
};
