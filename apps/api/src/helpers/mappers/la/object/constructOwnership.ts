import { institutions } from '@/helpers/mappers/staticMapping';
import { env } from '@config/env';
import { TBaseMetadata } from '@models';
import omitEmptyEs from 'omit-empty-es';

export const constructOwnership = (base: TBaseMetadata, data: any) => {
  const {
    owner,
    storedAt,
  } = data;

  delete data.owner
  delete data.storedAt

  /**
   * Ownership is determined by the identifier of the object
   * as we have objects from different institutions in Marcus.
   * If the identifier starts with 'ubb-' or 'ubm-' the ownership
   * is set to UiB, as owner is always to top level institution.
   */
  let ownership;
  switch (true) {
    case base.identifier.startsWith('ubb-'):
      ownership = institutions.uib;
      break;
    case base.identifier.startsWith('ubm-'):
      ownership = institutions.uib;
      break;
    case base.identifier.startsWith('sab-'):
      ownership = institutions.sab;
      break;
    case base.identifier.startsWith('bba-'):
      ownership = institutions.bba;
      break;
    default:
      ownership = institutions.uib;
      break;
  }

  // @TODO: Add the correct keeper when we have the correct data, inform that we need this data.
  const keeper = owner ? {
    id: owner?.id,
    type: 'Group',
    _label: owner?._label,
  } : undefined;

  const current_location = {
    id: storedAt?.identifier ? `${env.API_URL}/places/${storedAt?.identifier}` : 'https://data.ub.uib.no/place/storage',
    type: 'Place',
    _label: storedAt?._label ?? {
      no: ['Lager'],
      en: ['Storage'],
    },
  };

  return omitEmptyEs({
    ...data,
    current_keeper: [
      keeper,
    ],
    current_location,
    current_owner: [
      ownership,
    ],
  });
}

