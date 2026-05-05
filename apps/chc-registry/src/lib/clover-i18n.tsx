'use client';

import { initCloverI18n } from '@samvera/clover-iiif/i18n';

let initialized = false;

if (!initialized) {
  initCloverI18n({
    lng: 'nb', // or 'nn' / 'no'
    fallbackLng: ['nb', 'no', 'en'],
  });
  initialized = true;
}

export const CloverI18nProvider = () => null;

