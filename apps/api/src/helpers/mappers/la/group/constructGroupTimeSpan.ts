import { getTimeSpan } from '@helpers/mappers/la/shared/constructTimeSpan';
import { checkIntervalValidity } from '@lib/checkIntervalValidity';

export const constructGroupTimeSpan = (data: any) => {
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

    const formationTimeSpan = getTimeSpan(coalescedFormation, null, null);
    const extinctionTimeSpan = getTimeSpan(coalescedExtinction, null, null);
    if (!formationTimeSpan && !extinctionTimeSpan) return item;
    return {
      ...item,
      ...(formationTimeSpan ? {
        formedBy: {
          id: crypto.randomUUID(),
          _type: ['Formation'],
          timespan: formationDate ?? undefined,
        }
      } : null),
      ...(extinctionDate ? {
        dissolvedBy: {
          id: crypto.randomUUID(),
          _type: ['Dissolution'],
          timespan: extinctionTimeSpan ?? undefined,
        }
      } : null)
    };
  });
};
