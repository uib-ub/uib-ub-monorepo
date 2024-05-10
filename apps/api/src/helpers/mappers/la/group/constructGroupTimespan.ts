import { getTimespan } from '../../constructTimespan';
import { randomUUID } from 'crypto';
import { checkIntervalValidity } from '../../../validators/checkIntervalValidity';

export const constructGroupTimespan = (data: any) => {
  return data.map((item: any) => {
    const {
      ['http://dbpedia.org/ontology/extinctionYear']: extinctionYear,
      ['http://dbpedia.org/ontology/extinctionDate']: extinctionDate,
      ['http://dbpedia.org/ontology/deathYear']: formationYear,
      ['http://dbpedia.org/ontology/formationDate']: formationDate,
    } = item;

    delete item['http://dbpedia.org/ontology/extinctionYear'];
    delete item['http://dbpedia.org/ontology/extinctionDate'];
    delete item['http://dbpedia.org/ontology/formationYear'];
    delete item['http://dbpedia.org/ontology/formationDate'];

    let coalescedFormation = formationDate?.[0] ?? formationYear?.[0] ?? undefined;
    let coalescedExtinction = extinctionDate?.[0] ?? extinctionYear?.[0] ?? undefined;

    if (coalescedFormation && coalescedExtinction) {
      [coalescedFormation, coalescedExtinction] = checkIntervalValidity(coalescedFormation, coalescedExtinction);
    }

    const formationTimespan = getTimespan(coalescedFormation, null, null);
    const extinctionTimespan = getTimespan(coalescedExtinction, null, null);
    if (!formationTimespan && !extinctionTimespan) return item;
    return {
      ...item,
      ...(formationTimespan ? {
        formedBy: {
          id: randomUUID(),
          _type: ['Formation'],
          timespan: formationDate ?? undefined,
        }
      } : null),
      ...(extinctionDate ? {
        dissolvedBy: {
          id: randomUUID(),
          _type: ['Dissolution'],
          timespan: extinctionTimespan ?? undefined,
        }
      } : null)
    };
  });
};
