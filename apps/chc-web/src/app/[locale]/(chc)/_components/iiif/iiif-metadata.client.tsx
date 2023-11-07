"use client";

import { Label, Metadata, Summary } from "@samvera/nectar-iiif";

export const IIIFMetadata = ({
  label,
  summary,
  metadata,
  lang,
}: {
  label: any;
  summary: any;
  metadata: any;
  lang?: string;
}) => {
  return (
    <div>
      <Label label={label} as="h1" className="text-lg font-black" lang={lang} />
      <Summary summary={summary} as="p" lang={lang} />
      <Metadata metadata={metadata} lang={lang} />
    </div>
  );
};
