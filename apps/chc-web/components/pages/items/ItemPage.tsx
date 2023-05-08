import { IIIFMetadata } from 'components/shared/IIIF/IIIFMetadata.client';
import ManifestViewer from 'components/shared/IIIF/ManifestViewer.client';
import { InternationalLabel } from 'components/shared/InternationalLabel.client';
import LocaleSwitcher from 'components/shared/LocaleSwitcher';
import { notFound } from 'next/navigation';

async function getData(manifest: string) {
  const res = await fetch(manifest);
  // The return value is *not* serialized
  // You can return Date, Map, Set, etc.

  if (!res.ok) {
    console.log(res)
    if (res.status === 404) {
      return undefined
    } else {
      throw new Error('Failed to fetch data');
    }
  }

  return res.json();
}

export async function ItemPage({
  data,
  locale
}: {
  data: any,
  locale: string
}) {
  if (!data?.subjectOfManifest) {
    notFound();
  }

  const manifest = await getData(data.subjectOfManifest)

  if (!manifest) {
    notFound();
  }

  return (
    <>
      <InternationalLabel label={data.label} lang={locale} />
      <ManifestViewer
        id={manifest}
        options={{
          canvasHeight: '70vh',
          renderAbout: false,
          showIIIFBadge: false,
          showTitle: false,
          showInformationToggle: false,
        }}
      />
      <div className="max-w-prose">
        <IIIFMetadata label={manifest.label} summary={manifest.summary} metadata={manifest.metadata} lang={locale} />
      </div>

      <LocaleSwitcher locale={locale} />

      {/* <pre className='text-xs'>{JSON.stringify(data, null, 2)}</pre> */}
    </>
  )
}