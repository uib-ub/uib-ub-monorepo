import React from 'react';
import { BsFillQuestionCircleFill } from 'react-icons/bs';
import Link from 'next/link';


export const usedSpecificObject = {
  name: 'usedSpecificObject',
  title: 'Brukte spesifikt objekt',
  description: (
    <span>
      Objekt som ble brukt i aktiviteten. Legg til{' '}
      <Link target="blank" href={'/desk/objekt'}>
        nytt objekt
      </Link>
      .{' '}
      <Link
        target="blank"
        href={'https://muna.xyz/docs/model/properties#used-spesific-object'}
      >
        <BsFillQuestionCircleFill />
      </Link>
    </span>
  ),
  type: 'array',
  of: [{ type: 'reference', to: [{ type: 'HumanMadeObject' }] }],
};
