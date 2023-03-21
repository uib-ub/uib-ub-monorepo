'use client'

import { Label, Metadata, Summary } from "@samvera/nectar-iiif";

export const IIIFMetadata = ({ label, summary, metadata, lang }: {
  label: any,
  summary: any,
  metadata: any,
  lang?: string,
}) => {
  return (
    <div className="mt-10 ring-2 ring-offset-8 ring-orange-400 rounded-sm before:content-['IIIFMetadata'] before:relative before:bg-white before:-top-[22px] before:px-2">
      <Label label={label} as="h1" className='text-lg font-black' lang={lang} />
      <Summary summary={summary} as="p" lang={lang} />
      <Metadata metadata={metadata} lang={lang} />
    </div>
  )
}