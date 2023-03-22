'use client'

import { Label, Metadata, Summary } from "@samvera/nectar-iiif";
import { Boundary } from '../Boundary';

export const IIIFMetadata = ({ label, summary, metadata, lang }: {
  label: any,
  summary: any,
  metadata: any,
  lang?: string,
}) => {
  return (
    <Boundary color='cyan' labels={['IIIFMetadata']} size='small'>
      <div>
        <Label label={label} as="h1" className='text-lg font-black' lang={lang} />
        <Summary summary={summary} as="p" lang={lang} />
        <Metadata metadata={metadata} lang={lang} />
      </div>
    </Boundary>
  )
}