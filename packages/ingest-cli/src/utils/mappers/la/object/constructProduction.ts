import { env } from '../../../../env';
import { getTimeSpan } from '../shared/constructTimeSpan';
import { checkIntervalValidity, coalesceLabel } from 'utils';
import omitEmptyEs from 'omit-empty-es';
import { getLAApiType } from '../mapToGeneralClass';

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
    reproducedBy,
    long,
    lat,
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
  delete data.long
  delete data.lat

  let start = madeAfter || madeAfterDate?.['@value'] || undefined;
  let end = madeBefore || madeBeforeDate?.['@value'] || undefined;
  let makerArray: any[] = [];
  let reproducedByArray: any[] = [];
  let tookPlaceAt: any = undefined;

  if (start && end) {
    [start, end] = checkIntervalValidity(start, end);
  }

  const timespan = getTimeSpan(Array.isArray(created) ? created[0] : created ?? createdYear?.['@value'], start, end);

  if (maker) {
    makerArray = maker.map((actor: any) => {
      const { path, type } = getLAApiType(actor.type);
      return {
        id: `${env.API_BASE_URL}/${path}/${actor.identifier}`,
        type,
        _label: coalesceLabel(actor._label),
      }
    })
  }

  if (Array.isArray(reproducedBy)) {
    reproducedByArray = reproducedBy.map((actor: any) => {
      const { path, type } = getLAApiType(actor.type);
      return {
        id: `${env.API_BASE_URL}/${path}/${actor.identifier}`,
        type,
        _label: coalesceLabel(actor._label),
      }
    })
  };

  if (reproducedBy && !Array.isArray(reproducedBy)) {
    reproducedByArray = [reproducedBy].map((actor: any) => {
      const { path, type } = getLAApiType(actor.type);
      return {
        id: `${env.API_BASE_URL}/${path}/${actor.identifier}`,
        type,
        _label: coalesceLabel(actor._label),
      }
    })
  };

  if (long && lat) {
    tookPlaceAt = [{
      id: `${env.API_BASE_URL}/places/${long}/${lat}`,
      type: 'Place',
      _label: `${long}, ${lat}`,
      defined_by_geojson: `{"type":"Feature","geometry":{"type":"Point","coordinates":[-${lat},${long}]}}`
    }]
  }

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
          id: `${env.API_BASE_URL}/concepts/${technique.identifier}`,
          type: 'Type',
          _label: coalesceLabel(technique._label),
        }
      }) ?? undefined,
      commissioner: commissionedBy?.map((actor: any) => {
        const { path, type } = getLAApiType(actor.type);
        return {
          id: `${env.API_BASE_URL}/${path}/${actor.identifier}`,
          type,
          _label: coalesceLabel(actor._label),
        }
      }) ?? undefined,
      timespan: timespan ?? undefined,
      took_place_at: tookPlaceAt ?? undefined,
    }
  });
};
