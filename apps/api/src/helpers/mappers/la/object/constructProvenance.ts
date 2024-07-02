import { env } from '@config/env';
import { aatProvenanceActivityType, institutions } from '@helpers/mappers/staticMapping';
import omitEmptyEs from 'omit-empty-es';

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
    relationArray = acquiredFrom.map((actor: any) => {
      const type = actor.type === 'Person' ? 'Person' : 'Group'
      const id = `${env.API_URL}/${actor.type === 'Person' ? 'people' : 'groups'}/${actor.identifier}`
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
                id: data.id,
                type: data.type,
                _label: data._label
              }
            ],
            transferred_title_from: [
              {
                id: id,
                type: type,
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
      const type = actor.type === 'Person' ? 'Person' : 'Group'
      const id = `${env.API_URL}/${actor.type === 'Person' ? 'people' : 'groups'}/${actor.identifier}`
      return {
        id: id,
        type: type,
        _label: actor._label
      }
    });
  }

  return omitEmptyEs({
    ...data,
    changed_ownership_through: [
      ...relationArray
    ],
    // @TODO. This should be researched further, as LA does not have an updated model for this.
    former_owner: [
      ...formerOwnerArray
    ]
  });
}