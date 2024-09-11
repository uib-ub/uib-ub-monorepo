import { getTimeSpan } from '@helpers/mappers/la/shared/constructTimeSpan';
import { checkIntervalValidity } from '@lib/checkIntervalValidity';

export const constructEventTimeSpan = (data: any) => {
  return data.map((item: any) => {
    const {
      ['http://data.ub.uib.no/ontology/begin']: begin,
      ['http://data.ub.uib.no/ontology/end']: end,
    } = item;

    delete item['http://data.ub.uib.no/ontology/begin'];
    delete item['http://data.ub.uib.no/ontology/end'];

    let start = begin?.[0] ?? undefined;
    let ending = end?.[0] ?? undefined;
    if (start && end) {
      [start, ending] = checkIntervalValidity(start, ending);
    }
    const timespan = getTimeSpan(null, start, ending);

    if (!timespan) return item;
    return {
      ...item,
      timespan: timespan ?? undefined,
    };
  });
};
