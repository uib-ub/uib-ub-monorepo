import React from 'react';
import { BsFillQuestionCircleFill } from 'react-icons/bs';
import Link from 'next/link';


export const showsVisualObject = {
  name: 'showsVisualObject',
  title: 'Viser merke eller bilde',
  description: (
    <span>
      Motiv vist på dette objectet.{' '}
      <Link target="blank" href={'https://muna.xyz/docs/model/properties#shown-visual-item'}>
        <BsFillQuestionCircleFill />
      </Link>
    </span>
  ),
  type: 'array',
  of: [{ type: 'VisualObject' }],
};
