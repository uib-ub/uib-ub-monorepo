import { IIIFMetadata } from 'components/shared/iiif/iiif-metadata.client';
import ManifestViewer from 'components/shared/iiif/manifest-viewer.client';
import { InternationalLabel } from 'components/shared/international-label.client';

export async function SamlaRecordPage({
  data,
  locale
}: {
  data: any,
  locale: string
}) {

  return (
    <>
      <InternationalLabel label={data.label} lang={locale} />
      <ManifestViewer
        id={data}
        options={{
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
        <IIIFMetadata label={data.label} summary={data.summary} metadata={data.metadata} lang={locale} />
      </div>
    </>
  )
}