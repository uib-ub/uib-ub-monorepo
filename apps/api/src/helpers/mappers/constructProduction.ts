import { getTimespan } from './constructTimespan';
import { randomUUID } from 'crypto';
import { checkIntervalValidity } from '../checkers/checkIntervalValidity';

export const constructProduction = (data: any) => {
  return data.map((item: any) => {
    const {
      ['http://xmlns.com/foaf/0.1/maker']: maker,
      ['http://purl.org/dc/terms/created']: created,
      ['http://data.ub.uib.no/ontology/madeAfter']: madeAfter,
      ['http://data.ub.uib.no/ontology/madeBefore']: madeBefore,
      //['http://data.ub.uib.no/ontology/technique']: technique,
    } = item;
    delete item['http://xmlns.com/foaf/0.1/maker'];
    delete item['http://purl.org/dc/terms/created'];
    delete item['http://data.ub.uib.no/ontology/madeAfter'];
    delete item['http://data.ub.uib.no/ontology/madeBefore'];

    let start = madeAfter?.[0] ?? undefined;
    let end = madeBefore?.[0] ?? undefined;

    if (start && end) {
      [start, end] = checkIntervalValidity(start, end);
    }
    const timespan = getTimespan(created?.[0], start, end);
    if (!timespan && !maker) return item;
    return {
      ...item,
      produced_by: {
        id: randomUUID(),
        _type: ['Production'],
        carried_out_by: maker ?? undefined,
        timespan: timespan ?? undefined,
      }
    };
  });
};
