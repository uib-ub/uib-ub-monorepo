import { getTimespan } from '../constructTimespan';
import { checkIntervalValidity } from '../../checkers/checkIntervalValidity';
import omitEmptyEs from 'omit-empty-es';

export const constructProduction = (data: any) => {
  const {
    maker,
    created,
    'dct:created': createdYear, // 'dct:created' is a gYear, 'created' is a Date
    madeAfter,
    madeBefore,
    technique,
    commissionedBy,
  } = data;

  if (!maker && !created && !createdYear && !madeAfter && !madeBefore && !technique && !commissionedBy) return data;

  delete data.maker
  delete data.created
  delete data['dct:created'] // 'dct:created' is a gYear, 'created' is a Date
  delete data.madeAfter
  delete data.madeBefore
  delete data.technique
  delete data.commissionedBy

  let start = madeAfter ?? undefined;
  let end = madeBefore ?? undefined;

  if (start && end) {
    [start, end] = checkIntervalValidity(start, end);
  }

  const timespan = getTimespan(created ?? createdYear?.['@value'], start, end);

  return omitEmptyEs({
    ...data,
    produced_by: {
      _type: 'Production',
      carried_out_by: maker?.map((actor: any) => {
        return {
          id: actor.id,
          type: actor.type,
          _label: actor._label,
        }
      }) ?? undefined,
      technique: technique?.map((technique: any) => {
        return {
          id: technique.id,
          type: technique.type,
          _label: technique._label,
        }
      }) ?? undefined,
      commissioner: commissionedBy?.map((actor: any) => {
        return {
          id: actor.id,
          type: actor.type,
          _label: actor._label,
        }
      }) ?? undefined,
      timespan: timespan ?? undefined,
    }
  });
};
