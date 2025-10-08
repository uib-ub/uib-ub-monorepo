import { checkIntervalValidity } from 'utils';
import { getTimeSpan } from '../shared/constructTimeSpan';
import { env } from '@/env';

export const constructCreation = (data: any) => {
  const {
    maker,
    madeAfter,
    madeBefore,
  } = data;

  if (!maker && !madeAfter && !madeBefore) return data;

  delete data.maker;
  delete data.madeAfter;
  delete data.madeBefore;

  let start = madeAfter;
  let end = madeBefore;

  if (start && end) {
    [start, end] = checkIntervalValidity(start, end);
  }

  const createdTimeSpan = getTimeSpan(start, end, null);

  return {
    ...data,
    created_by: {
      type: "Creation",
      _label: `Creation of collection by ${maker.map((m: any) => m.name).join(', ')}`,
      timespan: createdTimeSpan,
      created_by: maker.map((m: any) => ({
        type: "Person",
        id: `${env.PROD_URL}/person/${m.identifier}`,
        _label: m.name,
      })),
    },
  };
};