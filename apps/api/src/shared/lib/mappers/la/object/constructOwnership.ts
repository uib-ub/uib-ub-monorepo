import { institutions } from '@shared/lib/mappers/la/staticMapping';
import { env } from '@env';
import { TBaseMetadata } from '@shared/models';
import omitEmptyEs from 'omit-empty-es';
import { coalesceLabel } from '@shared/utils/coalesceLabel';

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
    _label: coalesceLabel(owner?._label),
  } : undefined;

  const current_permanent_location = [{
    id: storedAt?.identifier ? `${env.PROD_URL}/places/${storedAt?.identifier}` : `${env.PROD_URL}/place/storage`,
    type: 'Place',
    _label: coalesceLabel(storedAt?._label) ?? 'Storage',
  }];

  return omitEmptyEs({
    ...data,
    current_permanent_custodian: [
      keeper,
    ],
    current_permanent_location,
    current_owner: [
      ownership,
    ],
  });
}

