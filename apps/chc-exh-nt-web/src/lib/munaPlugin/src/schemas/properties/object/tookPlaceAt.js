import React from 'react';
import Link from 'next/link';

export const tookPlaceAt = {
  name: 'tookPlaceAt',
  title: 'Skjedde ved',
  description: (
    <span>
      Hvor skjedde dette? Legg til{' '}
      <Link target="blank" href={'/desk/steder'}>
        nytt sted
      </Link>
    </span>
  ),

  type: 'array',
  of: [{ type: 'reference', to: [{ type: 'Place' }] }],
  options: {
    semanticSanity: {
      '@container': '@set',
      '@type': '@id'
    }
  },
};
