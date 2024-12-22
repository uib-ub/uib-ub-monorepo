import React from 'react';
import { BsFillQuestionCircleFill } from 'react-icons/bs';
import Link from 'next/link';


export const subject = {
  name: 'subject',
  title: 'Emne',
  description: (
    <span>
      Emneord knyttet til dette objektet. Legg til{' '}
      <Link target="blank" href={'/desk/steder'}>
        nye emneord
      </Link>
      .{' '}
      <Link target="blank" href={'https://muna.xyz/docs/model/properties#subject'}>
        <BsFillQuestionCircleFill />
      </Link>
    </span>
  ),
  type: 'array',
  of: [
    {
      type: 'reference',
      to: [{ type: 'Concept' }],
    },
  ],
};
