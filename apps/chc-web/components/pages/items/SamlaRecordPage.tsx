import { IIIFMetadata } from 'components/shared/IIIF/IIIFMetadata.client';
import ManifestViewer from 'components/shared/IIIF/ManifestViewer.client';
import { InternationalLabel } from 'components/shared/InternationalLabel.client';
import LocaleSwitcher from 'components/shared/LocaleSwitcher';

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
        }}
      />
      <div className="max-w-prose">
        <IIIFMetadata label={data.label} summary={data.summary} metadata={data.metadata} lang={locale} />
      </div>

      <LocaleSwitcher locale={locale} />

      {/* <pre className='text-xs'>{JSON.stringify(data, null, 2)}</pre> */}
    </>
  )
}