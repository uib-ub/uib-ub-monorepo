import React from 'react';
import { BsFillQuestionCircleFill } from 'react-icons/bs';
import Link from 'next/link';

/**
 * Identified by
 * P1_is_identified_by
 */

export const identifiedBy = {
  name: 'identifiedBy',
  title: 'Identifisert av',
  description: (
    <span>
      Gjeldende, alternative, eksterne eller ugyldige identifikatorer.{' '}
      <Link target="blank" href={'https://muna.xyz/docs/model/properties#identified-by'}>
        <BsFillQuestionCircleFill />
      </Link>
    </span>
  ),
  type: 'array',
  of: [
    { type: 'Name' },
    { type: 'Identifier' }
  ],
  options: {
    modal: 'popup',
  },
};
