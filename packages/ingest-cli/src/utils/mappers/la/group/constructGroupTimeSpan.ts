import { getTimeSpan } from '../shared/constructTimeSpan';
import { checkIntervalValidity, coalesceLabel, } from 'utils';
import { env } from '@/env';
export const constructGroupTimeSpan = (data: any) => {
  const {
    extinctionYear,
    extinctionDate,
    formationYear,
    formationDate,
    ['dbo:extinctionYear']: extinctionYear2,
    ['dbo:formationYear']: formationYear2,
    based_near
  } = data;

  if (
    !extinctionYear &&
    !extinctionDate &&
    !formationYear &&
    !formationDate &&
    !extinctionYear2 &&
    !formationYear2 &&
    !based_near
  ) {
    return data;
  }

  delete data.extinctionYear
  delete data.extinctionDate
  delete data.formationYear
  delete data.formationDate
  delete data['dbo:extinctionYear']
  delete data['dbo:formationYear']
  delete data.based_near

  let basedNearArray: any[] = []

  let coalescedFormation = formationDate ?? formationYear ?? formationYear2 ?? undefined;
  let coalescedExtinction = extinctionDate ?? extinctionYear ?? extinctionYear2 ?? undefined;

  if (coalescedFormation && coalescedExtinction) {
    [coalescedFormation, coalescedExtinction] = checkIntervalValidity(coalescedFormation, coalescedExtinction);
  }

  const formationTimeSpan = getTimeSpan(coalescedFormation, null, null);
  const extinctionTimeSpan = getTimeSpan(coalescedExtinction, null, null);

  if (
    !formationTimeSpan &&
    !extinctionTimeSpan
  ) return data;

  if (based_near) {
    basedNearArray = based_near.map((place: any) => {
      return {
        id: `${env.API_URL}/place/${place.identifier}`,
        type: 'Place',
        _label: coalesceLabel(place._label),
      }
    })
  }


  return {
    ...data,
    ...(formationTimeSpan ? {
      formed_by: {
        id: `${env.PROD_URL}/event/${crypto.randomUUID()}`,
        _type: 'Formation',
        _label: `Formation of ${data._label}`,
        timespan: formationTimeSpan ?? undefined,
      }
    } : null),
    ...(extinctionTimeSpan ? {
      dissolved_by: {
        id: `${env.PROD_URL}/event/${crypto.randomUUID()}`,
        _type: 'Dissolution',
        _label: `Dissolution of ${data._label}`,
        timespan: extinctionTimeSpan ?? undefined,
      }
    } : null),
    residence: basedNearArray
  };
};
