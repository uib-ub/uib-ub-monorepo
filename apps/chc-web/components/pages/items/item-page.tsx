import { IIIFMetadata } from 'components/shared/iiif/iiif-metadata.client';
import ManifestViewer from 'components/shared/iiif/manifest-viewer.client';
import { InternationalLabel } from 'components/shared/international-label.client';
import { notFound } from 'next/navigation';

async function getData(manifest: string) {
  const res = await fetch(manifest, { next: { revalidate: 24000 } });

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
          canvasBackgroundColor: '#222',
          canvasHeight: '70vh',
          renderAbout: false,
          showIIIFBadge: false,
          showTitle: false,
          showInformationToggle: false,
          openSeadragon: {
            gestureSettingsMouse: {
              scrollToZoom: false,
            },
          },
        }}
      />
      <div className="max-w-prose">
        <IIIFMetadata label={manifest.label} summary={manifest.summary} metadata={manifest.metadata} lang={locale} />
      </div>
    </>
  )
}