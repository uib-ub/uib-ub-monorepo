import { env } from '../../../../env';
import { coalesceLabel } from 'utils';
import omitEmptyEs from 'omit-empty-es';

export const constructCollection = (data: any) => {
  const {
    isPartOf,
  } = data;
  if (!isPartOf) return data;

  delete data.isPartOf

  const sets = isPartOf.map((collection: any) => {
    const id = `${env.API_BASE_URL}/set/${collection.identifier}`
    return {
      id: id,
      type: 'Set',
      _label: coalesceLabel(collection._label),
    };
  })

  return omitEmptyEs({
    ...data,
    member_of: sets,
  });
}