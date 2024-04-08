import { getTimespan } from './constructTimespan';
import { randomUUID } from 'crypto';
import { checkIntervalValidity } from '../checkers/checkIntervalValidity';
import omitEmptyEs from 'omit-empty-es';

export const constructProduction = (data: any) => {
  const {
    maker,
    created,
    placeOfPublication,
    publishedYear,
    madeAfter,
    madeBefore,
    technique,
  } = data;

  if (!maker && !created && !placeOfPublication && !publishedYear && !madeAfter && !madeBefore && !technique) return data;

  delete data.maker
  delete data.created
  delete data.placeOfPublication
  delete data.publishedYear
  delete data.madeAfter
  delete data.madeBefore
  delete data.technique

  let start = madeAfter ?? undefined;
  let end = madeBefore ?? undefined;

  if (start && end) {
    [start, end] = checkIntervalValidity(start, end);
  }
  const timespan = getTimespan(created, start, end);

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
      took_place_at: placeOfPublication ? {
        id: placeOfPublication.id,
        type: placeOfPublication.type,
        _label: placeOfPublication._label,
      } : undefined,
      technique: technique?.map((technique: any) => {
        return {
          id: technique.id,
          type: technique.type,
          _label: technique._label,
        }

      }) ?? undefined,
      timespan: timespan ?? undefined,
      publishedYear, // @TODO: How to handle this?
    }
  });
};
