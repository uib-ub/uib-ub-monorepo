import { env } from '@/env';
import { coalesceLabel } from 'utils';

export const constructHierarchy = (data: any) => {
  const {
    isPartOf
  } = data;

  if (!isPartOf) return data;

  delete data.isPartOf

  return {
    ...data,
    member_of: isPartOf.map((o: any) => {
      return {
        id: `${env.PROD_URL}/sets/${o.identifier}`,
        type: 'Set',
        _label: coalesceLabel(o._label),
      }
    })
  }
}