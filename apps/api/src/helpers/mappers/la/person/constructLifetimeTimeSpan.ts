import { aatSiblingsType } from '@/helpers/mappers/staticMapping';
import { env } from '@config/env';
import { getTimeSpan } from '@helpers/mappers/la/shared/constructTimeSpan';
import { checkIntervalValidity } from '@lib/checkIntervalValidity';
import omitEmptyEs from 'omit-empty-es';

export const constructLifetimeTimeSpan = (data: any) => {

  const {
    birthYear,
    birthDate,
    deathYear,
    deathDate,
    birthPlace,
    deathPlace,
    parent,
    based_near,
    sibling,
  } = data;

  if (
    !birthDate &&
    !birthYear &&
    !deathDate &&
    !deathYear &&
    !birthPlace &&
    !deathPlace &&
    !parent &&
    !based_near &&
    !sibling
  ) return data;

  delete data.birthYear;
  delete data.birthDate;
  delete data.deathYear;
  delete data.deathDate;
  delete data.birthPlace;
  delete data.deathPlace;
  delete data.parent;
  delete data.based_near;
  delete data.sibling;

  let siblingArray: any[] = [];

  if (sibling) {
    siblingArray = [{
      type: 'SocialRelationship',
      _label: {
        en: 'Siblings',
        no: 'Søsken'
      },
      classified_as: [
        aatSiblingsType,
      ],
      involves_partner: sibling.map((sibling: any) => {
        return {
          id: `${env.API_URL}/people/${sibling.identifier}`,
          type: 'Person',
          _label: sibling._label,
        }
      })
    }
    ]
  }

  let start = birthDate ?? birthYear ?? undefined;
  let end = deathDate ?? deathYear ?? undefined;

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
        parent: parent?.map((parent: any) => ({ // TODO: not valid CRM, as this should be "by mother" or "from father
          id: `${env.API_URL}/people/${parent.identifier}`,
          type: 'Person',
          _label: parent._label,
        })),
        took_place_at: birthPlace ? [{
          id: birthPlace.id,
          type: 'Place',
          _label: birthPlace._label,
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
          _label: deathPlace._label,
        }] : undefined,
      }
    } : null),
    residence: based_near, // TODO: make into a proper Place object ref,
    partner_in: [
      ...siblingArray
    ]
  });
};
