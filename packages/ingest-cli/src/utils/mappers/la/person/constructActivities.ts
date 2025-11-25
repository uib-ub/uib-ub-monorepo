import { env } from '@/env';

export const constructActivities = (base: any, data: any) => {
  const {
    spouse
  } = data

  if (!spouse) {
    return data;
  }

  delete data.spouse;

  return {
    ...data,
    participated_in: spouse ? spouse.map((spouse: any) => {
      return {
        id: `${env.PROD_URL}/activities/${crypto.randomUUID()}`,
        type: 'Activity',
        _label: 'Marriage',
        carried_out_by: [
          {
            id: `${env.PROD_URL}/person/${spouse.identifier}`,
            type: 'Person',
            _label: spouse._label,
          },
          {
            id: `${env.PROD_URL}/person/${base.identifier}`,
            type: 'Person',
            _label: data._label,
          }
        ]
      }
    }) : []
  }
};