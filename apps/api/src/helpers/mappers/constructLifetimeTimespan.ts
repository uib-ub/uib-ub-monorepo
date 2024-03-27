import { getTimespan } from './constructTimespan';
import { randomUUID } from 'crypto';
import { checkIntervalValidity } from '../checkers/checkIntervalValidity';

export const constructLifetimeTimespan = (data: any) => {
  return data.map((item: any) => {
    const {
      ['http://dbpedia.org/ontology/birthYear']: birthYear, ['http://dbpedia.org/ontology/birthDate']: birthDate, ['http://dbpedia.org/ontology/deathYear']: deathYear, ['http://dbpedia.org/ontology/deathDate']: deathDate,
    } = item;
    delete item['http://dbpedia.org/ontology/birthYear'];
    delete item['http://dbpedia.org/ontology/birthDate'];
    delete item['http://dbpedia.org/ontology/deathYear'];
    delete item['http://dbpedia.org/ontology/deathDate'];

    let start = deathDate?.[0] ?? deathYear?.[0] ?? undefined;
    let end = birthDate?.[0] ?? birthYear?.[0] ?? undefined;

    if (start && end) {
      [start, end] = checkIntervalValidity(start, end);
    }

    const birthTimespan = getTimespan(start, null, null);
    const deathTimespan = getTimespan(end, null, null);
    if (!deathTimespan && !birthTimespan) return item;
    return {
      ...item,
      ...(birthTimespan ? {
        birth: {
          id: randomUUID(),
          _type: ['Birth'],
          timespan: birthTimespan ?? undefined,
        }
      } : null),
      ...(deathTimespan ? {
        death: {
          id: randomUUID(),
          _type: ['Death'],
          timespan: deathTimespan ?? undefined,
        }
      } : null)
    };
  });
};
