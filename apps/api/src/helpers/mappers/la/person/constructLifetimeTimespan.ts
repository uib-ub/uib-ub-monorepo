import omitEmptyEs from 'omit-empty-es';
import { API_URL } from '../../../../config/constants';
import { checkIntervalValidity } from '../../../validators/checkIntervalValidity';
import { getTimespan } from '../../constructTimespan';
import { aatSiblingsType } from '../../staticMapping';

export const constructLifetimeTimespan = (data: any) => {

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
          id: `${API_URL}/people/${sibling.identifier}`,
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

  const birthTimespan = getTimespan(start, null, null);
  const deathTimespan = getTimespan(end, null, null);

  return omitEmptyEs({
    ...data,
    ...(birthTimespan ? {
      born: {
        _type: 'Birth',
        timespan: birthTimespan,
        parent: parent?.map((parent: any) => ({ // TODO: not valid CRM, as this should be "by mother" or "from father
          id: `${API_URL}/people/${parent.identifier}`,
          type: 'Person',
          _label: parent._label,
        })),
        took_place_at: birthPlace ? {
          id: birthPlace._id,
          type: 'Place',
          _label: birthPlace._label,
        } : undefined,
      }
    } : null),
    ...(deathTimespan ? {
      died: {
        _type: 'Death',
        timespan: deathTimespan,
        took_place_at: deathPlace ? {
          id: deathPlace.id,
          type: 'Place',
          _label: deathPlace._label,
        } : undefined,
      }
    } : null),
    residence: based_near, // TODO: make into a proper Place object ref,
    partner_in: [
      ...siblingArray
    ]
  });
};
