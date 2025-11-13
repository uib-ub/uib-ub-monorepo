import { ubbChildrenType, ubbFriendshipType, aatSiblingsType } from '../staticMapping';
import { env } from '../../../../env';
import { getTimeSpan } from '../shared/constructTimeSpan';
import { checkIntervalValidity, coalesceLabel } from 'utils';
import omitEmptyEs from 'omit-empty-es';

export const constructLifetimeTimeSpan = (data: any) => {

  const {
    birthYear,
    birthDate,
    'dbo:birthDate': dboBirthDate,
    deathYear,
    deathDate,
    'dbo:deathDate': dboDeathDate,
    birthPlace,
    deathPlace,
    parent,
    based_near,
    sibling,
    children,
    knows
  } = data;

  if (
    !birthDate &&
    !dboBirthDate &&
    !birthYear &&
    !deathDate &&
    !dboDeathDate &&
    !deathYear &&
    !birthPlace &&
    !deathPlace &&
    !parent &&
    !based_near &&
    !sibling &&
    !children &&
    !knows
  ) return data;

  delete data.birthYear;
  delete data.birthDate;
  delete data['dbo:birthDate'];
  delete data.deathYear;
  delete data.deathDate;
  delete data['dbo:deathDate'];
  delete data.birthPlace;
  delete data.deathPlace;
  delete data.parent;
  delete data.based_near;
  delete data.sibling;
  delete data.children;
  delete data.knows;

  let siblingArray: any[] = [];
  let childrenArray: any[] = [];
  let basedNearArray: any[] = [];
  let knowsArray: any[] = [];

  if (knows) {
    knowsArray = knows.map((know: any) => {
      return {
        type: 'SocialRelationship',
        _label: `Knows ${coalesceLabel(know._label)}`,
        classified_as: [
          ubbFriendshipType,
        ],
        involves_partner: [{
          id: `${env.API_BASE_URL}/person/${know.identifier}`,
          type: 'Person',
          _label: coalesceLabel(know._label),
        }]
      }
    })
  }

  if (sibling) {
    siblingArray = [{
      type: 'SocialRelationship',
      _label: 'Siblings',
      classified_as: [
        aatSiblingsType,
      ],
      involves_partner: sibling.map((sibling: any) => {
        return {
          id: `${env.API_BASE_URL}/person/${sibling.identifier}`,
          type: 'Person',
          _label: coalesceLabel(sibling._label),
        }
      })
    }]
  }

  if (children) {
    childrenArray = [{
      type: 'SocialRelationship',
      _label: 'Children',
      classified_as: [
        ubbChildrenType,
      ],
      involves_partner: children.map((child: any) => {
        return {
          id: `${env.API_BASE_URL}/person/${child.identifier}`,
          type: 'Person',
          _label: coalesceLabel(child._label),
        }
      })
    }]
  }

  if (based_near) {
    basedNearArray = based_near.map((place: any) => {
      return {
        id: `${env.API_BASE_URL}/places/${place.identifier}`,
        type: 'Place',
        _label: coalesceLabel(place._label),
      }
    })
  }

  let start = birthDate ?? dboBirthDate?.['@value'] ? dboBirthDate?.['@value'] : dboBirthDate ?? birthYear ?? undefined;
  let end = deathDate ?? dboDeathDate?.['@value'] ? dboDeathDate?.['@value'] : dboDeathDate ?? deathYear ?? undefined;

  if (start && end) {
    [start, end] = checkIntervalValidity(start, end);
  }

  const birthTimeSpan = getTimeSpan(start, null, null);
  const deathTimeSpan = getTimeSpan(end, null, null);

  return omitEmptyEs({
    ...data,
    ...(birthTimeSpan ? {
      born: {
        _type: 'Birth',
        timespan: birthTimeSpan,
        ...(parent?.reduce((acc: any, parent: any) => {
          if (parent.gender === 'female') {
            return {
              ...acc,
              by_mother: {
                id: `${env.API_BASE_URL}/person/${parent.identifier}`,
                type: 'Person',
                _label: coalesceLabel(parent._label)
              }
            }
          }
          if (parent.gender === 'male') {
            return {
              ...acc,
              from_father: {
                id: `${env.API_BASE_URL}/person/${parent.identifier}`,
                type: 'Person',
                _label: coalesceLabel(parent._label)
              }
            }
          }
          return acc; // Skip parents with unknown gender
        }, {})),
        took_place_at: birthPlace ? [{
          id: birthPlace.id,
          type: 'Place',
          _label: coalesceLabel(birthPlace._label),
        }] : undefined,
      }
    } : null),
    ...(deathTimeSpan ? {
      died: {
        _type: 'Death',
        timespan: deathTimeSpan,
        took_place_at: deathPlace ? [{
          id: deathPlace.id,
          type: 'Place',
          _label: coalesceLabel(deathPlace._label),
        }] : undefined,
      }
    } : null),
    residence: basedNearArray,
    partner_in: [
      ...siblingArray,
      ...childrenArray,
      ...knowsArray
    ]
  });
};
