import { groq } from 'next-sanity';
import { mainNav } from './mainNav';
import { siteSettings } from './siteSettings';

export const frontpageQuery = groq`
  {
    ${siteSettings},
    ${mainNav}
  }
`
