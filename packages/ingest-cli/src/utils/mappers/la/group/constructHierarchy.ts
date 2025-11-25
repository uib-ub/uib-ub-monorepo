import { env } from '@/env';
import { coalesceLabel } from 'utils';
export const constructHierarchy = (data: any) => {
  const {
    subOrganizationOf
  } = data;

  if (!subOrganizationOf) return data;

  delete data.subOrganizationOf

  return {
    ...data,
    member_of: subOrganizationOf.map((o: any) => {
      return {
        id: `${env.PROD_URL}/group/${o.identifier}`,
        type: 'Group',
        _label: coalesceLabel(o.label),
      }
    })
  }
}