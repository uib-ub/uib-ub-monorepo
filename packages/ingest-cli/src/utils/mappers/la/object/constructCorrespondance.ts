import { fixmeCorrespondanceType } from '../staticMapping';
import { env } from '../../../../env';
import { coalesceLabel } from 'utils';
import omitEmptyEs from 'omit-empty-es';
import { getLAApiType } from '../mapToGeneralClass';

/**
 * Construct correspondance object
 * NB: This function is not based on LinkedArt
 * @param {object} data - The data to construct correspondance from
 * @returns {object} - The constructed correspondance object 
 */
export const constructCorrespondance = (data: any) => {
  // @TODO: Should we get the timespan and add it to the Activity/Move object?
  const {
    originPlace = [],
    placeDelivery = [],
    receivedFrom = [],
    sender = [],
    recipient = [],
    reciever = [],
  } = data;

  if (
    originPlace.length === 0
    && placeDelivery.length === 0
    && receivedFrom.length === 0
    && sender.length === 0
    && recipient.length === 0
    && reciever.length === 0
  ) return data;

  delete data.originPlace
  delete data.placeDelivery
  delete data.receivedFrom
  delete data.sender
  delete data.recipient
  delete data.reciever

  const targetArray = [...reciever, ...recipient]
  const sourceArray = [...receivedFrom, ...sender]

  const correspondanceArray = [{
    id: crypto.randomUUID(),
    type: "Activity",
    classified_as: [
      fixmeCorrespondanceType,
    ],
    carried_out_by: sourceArray?.map((source: any) => {
      const { path, type } = getLAApiType(source.type);
      return {
        id: `${env.API_BASE_URL}/${path}/${source.identifier}`,
        type,
        _label: coalesceLabel(source._label),
      }
    }),
    recipient: targetArray?.map((source: any) => {
      const { path, type } = getLAApiType(source.type);
      return {
        id: `${env.API_BASE_URL}/${path}/${source.identifier}`,
        type,
        _label: coalesceLabel(source._label),
      }
    }),
    part: [
      {
        type: "Move",
        _label: {
          no: ["Sendt"],
          en: ["Sent"],
        },
        moved: [
          {
            id: `${env.API_BASE_URL}/object/${data.identifier}`,
            type: data.type,
            _label: coalesceLabel(data._label),
          }
        ],
        moved_from: originPlace?.map((place: any) => {
          const id = `${env.API_BASE_URL}/places/${place.identifier}`
          return {
            id: id,
            type: 'Place',
            _label: coalesceLabel(place._label),
          }
        }),
        moved_to: placeDelivery?.map((place: any) => {
          const id = `${env.API_BASE_URL}/places/${place.identifier}`
          return {
            id: id,
            type: 'Place',
            _label: coalesceLabel(place._label),
          }
        }),
      }
    ]
  }];


  return omitEmptyEs({
    ...data,
    was_used_for: [
      ...correspondanceArray,
    ]
  });
}