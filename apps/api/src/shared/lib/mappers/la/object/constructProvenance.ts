import { env } from '@env';
import { coalesceLabel } from '@shared/utils/coalesceLabel';
import { aatProvenanceActivityType, institutions } from '@shared/lib/mappers/la/staticMapping';
import omitEmptyEs from 'omit-empty-es';
import { getLAApiType } from '../mapToGeneralClass';

export const constructProvenance = (data: any) => {
  const {
    acquiredFrom,
    formerOwner,
  } = data;

  if (!acquiredFrom && !formerOwner) return data;

  delete data.acquiredFrom
  delete data.formerOwner

  let relationArray: any[] = []
  let formerOwnerArray: any[] = []

  if (acquiredFrom) {
    console.log("🚀 ~ constructProvenance ~ acquiredFrom:", acquiredFrom)
    relationArray = acquiredFrom.map((actor: any) => {
      const { path, type } = getLAApiType(actor.type);
      return {
        type: "Activity",
        _label: "Acquisition",
        classified_as: [
          aatProvenanceActivityType,
        ],
        part: [
          {
            type: "Acquisition",
            _label: {
              no: `Ervervelse`,
              en: `Acquisition`,
            },
            transferred_title_of: [
              {
                id: `${env.PROD_URL}/items/${data.identifier}`,
                type: data.type,
                _label: data._label
              }
            ],
            transferred_title_from: [
              {
                id: `${env.PROD_URL}/${path}/${actor.identifier}`,
                type,
                _label: actor._label
              }
            ],
            transferred_title_to: [
              institutions.ubb
            ]
          }
        ]
      }
    });
  }

  if (Array.isArray(formerOwner) && formerOwner.length > 0) {
    formerOwnerArray = formerOwner.map((actor: any) => {
      const { path, type } = getLAApiType(actor.type);
      return {
        id: `${env.PROD_URL}/provenance/${data.identifier}`,
        type: 'Activity',
        _label: `Transfer of ${data._label}`,
        part: [{
          type: 'Transfer',
          transferred: [
            {
              id: `${env.PROD_URL}/items/${data.identifier}`,
              type: data.type,
              _label: data._label
            }
          ],
          transferred_from: [
            {
              id: `${env.PROD_URL}/${path}/${actor.identifier}`,
              type,
              _label: coalesceLabel(actor._label),
            }
          ],
          transferred_to: [
            institutions.ubb
          ]
        }]
      }
    });
  }

  return omitEmptyEs({
    ...data,
    // @TODO. This is probably not correct, as this is proventance that refers to objects, but the object do not point back to the provenance.
    changed_ownership_through: [
      ...relationArray,
      ...formerOwnerArray,
    ],
  });
}