import React from 'react';
import { BsFillQuestionCircleFill } from 'react-icons/bs';
import Link from 'next/link';


export const represents = {
  name: 'represents',
  title: 'Representerer',
  description: (
    <span>
      Hva dette motivet representerer.{' '}
      <Link target="blank" href={'https://muna.xyz/docs/model/properties#represents'}>
        <BsFillQuestionCircleFill />
      </Link>
    </span>
  ),
  type: 'array',
  of: [
    {
      type: 'reference',
      to: [
        { type: 'HumanMadeObject' },
        { type: 'Actor' },
        { type: 'Concept' }
      ],
    },
  ],
};
