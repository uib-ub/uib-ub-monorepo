import { env } from '@config/env';
import { getTimeSpan } from '@helpers/mappers/la/shared/constructTimeSpan';
import { checkIntervalValidity } from '@lib/checkIntervalValidity';
import omitEmptyEs from 'omit-empty-es';

export const constructProduction = (data: any) => {
  const {
    maker,
    created,
    'dct:created': createdYear, // 'dct:created' is a gYear, 'created' is a Date
    madeAfter,
    'ubbont:madeAfter': madeAfterDate,
    madeBefore,
    'ubbont:madeBefore': madeBeforeDate,
    technique,
    commissionedBy,
    reproducedBy
  } = data;

  if (!maker && !created && !createdYear && !madeAfter && !madeAfterDate && !madeBefore && !madeBeforeDate && !technique && !commissionedBy && !reproducedBy) return data;

  delete data.maker
  delete data.created
  delete data['dct:created'] // 'dct:created' is a gYear, 'created' is a Date
  delete data.madeAfter
  delete data['ubbont:madeAfter']
  delete data.madeBefore
  delete data['ubbont:madeBefore']
  delete data.technique
  delete data.commissionedBy
  delete data.reproducedBy

  let start = madeAfter || madeAfterDate?.['@value'] || undefined;
  let end = madeBefore || madeBeforeDate?.['@value'] || undefined;
  let makerArray = [];
  let reproducedByArray = [];

  if (start && end) {
    [start, end] = checkIntervalValidity(start, end);
  }

  const timespan = getTimeSpan(Array.isArray(created) ? created[0] : created ?? createdYear?.['@value'], start, end);

  if (maker) {
    makerArray = maker.map((actor: any) => {
      const type = actor.type === 'Person' ? 'Person' : 'Group'
      const id = `${env.API_URL}/${actor.type === 'Person' ? 'people' : 'groups'}/${actor.identifier}`
      return {
        id: id,
        type: type,
        _label: actor._label,
      }
    })
  }

  if (Array.isArray(reproducedBy)) {
    reproducedByArray = reproducedBy.map((actor: any) => {
      const type = actor.type === 'Person' ? 'Person' : 'Group'
      const id = `${env.API_URL}/${actor.type === 'Person' ? 'people' : 'groups'}/${actor.identifier}`
      return {
        id: id,
        type: type,
        _label: actor._label,
      }
    })
  };

  if (reproducedBy && !Array.isArray(reproducedBy)) {
    reproducedByArray = [reproducedBy].map((actor: any) => {
      const type = actor.type === 'Person' ? 'Person' : 'Group'
      const id = `${env.API_URL}/${actor.type === 'Person' ? 'people' : 'groups'}/${actor.identifier}`
      return {
        id: id,
        type: type,
        _label: actor._label,
      }
    })
  };

  return omitEmptyEs({
    ...data,
    produced_by: {
      _type: 'Production',
      carried_out_by: [
        ...makerArray,
        ...reproducedByArray
      ],
      technique: technique?.map((technique: any) => {
        return {
          id: technique.id,
          type: 'Type',
          _label: technique._label,
        }
      }) ?? undefined,
      commissioner: commissionedBy?.map((actor: any) => {
        const type = actor.type === 'Person' ? 'Person' : 'Group'
        const id = `${env.API_URL}/${actor.type === 'Person' ? 'people' : 'groups'}/${actor.identifier}`
        return {
          id: id,
          type: type,
          _label: actor._label,
        }
      }) ?? undefined,
      timespan: timespan ?? undefined,
    }
  });
};
