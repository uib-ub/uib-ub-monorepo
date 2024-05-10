import omitEmptyEs from 'omit-empty-es';
import { aatProvenanceActivityType, institutions } from '../../staticMapping';

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
              no: `Ervervelsen av ${data.identifier}`,
              en: `Acquisition of ${data.identifier}`
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
                id: actor.id,
                type: actor.type,
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

  if (formerOwner) {
    relationArray = formerOwner.map((actor: any) => {
      return {
        id: actor.id,
        type: actor.type,
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