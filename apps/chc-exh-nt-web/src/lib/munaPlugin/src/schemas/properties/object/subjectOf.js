import Link from 'next/link';
import React from 'react';
import { BsFillQuestionCircleFill } from 'react-icons/bs';

export const subjectOf = {
  name: 'subjectOf',
  title: 'Omhandlet i',
  titleEN: 'Subject of',
  description: (
    <span>
      <strong>Eksperimentel:</strong> Tekster om dette objektet.{' '}
      <Link target="blank" href={'https://muna.xyz/docs/model/properties#subject-of'}>
        <BsFillQuestionCircleFill />
      </Link>
    </span>
  ),
  type: 'array',
  of: [
    {
      type: 'reference',
      to: [{ type: 'LinguisticDocument' }],
    },
  ],
  /* options: {
    filter: '__i18n_lang == $base',
    filterParams: { base: config.base },
    semanticSanity: {
      '@container': '@list',
      '@type': '@id'
    }
  }, */
};
