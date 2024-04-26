import omitEmptyEs from 'omit-empty-es';
import { TBaseMetadata } from '../../../models';

/*
  * Construct ownership object
  * @param {Object} data - data object
  * @returns {Object} - constructed ownership object
*/

export const constructOwnership = (base: TBaseMetadata, data: any) => {
  const {
    owner,
    storedAt,
  } = data;

  if (!owner && !storedAt) return data;

  delete data.owner
  delete data.storedAt

  const uib = {
    id: 'http://data.ub.uib.no/instance/organization/79543723-f0e9-40a6-bfb9-4830f080e887',
    type: 'Group',
    _label: 'University of Bergen',
  }

  const sab = {
    id: 'http://data.ub.uib.no/instance/organization/statsarkivet-i-bergen',
    type: 'Group',
    _label: 'Statsarkivet i Bergen',
  }

  const ownership = [
    ...(base.identifier.startsWith('sab-') ? [sab] : [uib])
  ];

  const keeper = [{
    id: owner?.id,
    type: 'Group',
    _label: owner?._label,
  }];

  const current_location = [{
    id: storedAt?.id ?? 'https://data.ub.uib.no/place/storage',
    type: 'Place',
    _label: storedAt?._label ?? 'Storage',
  }];

  return omitEmptyEs({
    ...data,
    current_keeper: [
      ...keeper,
    ],
    current_location: [
      ...current_location,
    ],
    current_owner: [
      ...ownership,
    ],
  });
}

