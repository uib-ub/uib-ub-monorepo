import { env } from 'process';
import { coalesceLabel } from 'utils';
import omitEmptyEs from 'omit-empty-es';

export const constructMembership = (data: any) => {
  const {
    memberOf
  } = data;

  if (!memberOf) return data;

  delete data.memberOf;

  return omitEmptyEs({
    ...data,
    current_or_former_member_of: memberOf.map((group: any) => {
      return {
        id: `${env.API_URL}/groups/${group.identifier}`,
        type: 'Group',
        _label: coalesceLabel(group._label),
      }
    })
  })
}