import { IIIFMetadata } from 'components/shared/IIIF/IIIFMetadata.client';
import ManifestViewer from 'components/shared/IIIF/ManifestViewer.client';
import { getSamlaIIIFv2RecordData } from 'lib/samla/samla.client';
import { GetServerSideProps } from 'next';
import Link from 'next/link';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = context.params?.id as string;
  const data = await getSamlaIIIFv2RecordData(id);
  return {
    props: {
      data,
      id
    }
  };
}

function SamlaRecord({ data, id }: { data: any, id: string }) {

  if (!data) {
    return (
      <div>
        <h1>404</h1>
        <p>Could not find the record you were looking for.</p>
        <Link href='/'>
          <a>Go back home</a>
        </Link>
      </div>
    )
  }

  /* delete data.provider */
  return (
    <div className="flex min-h-screen flex-col bg-white text-black">
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-x-5 bg-white/80 py-4 px-4 backdrop-blur md:py-5 md:px-16 lg:px-32">
        <Link
          href="/items/ubb-jg-l-0985"
          className={`text-lg hover:text-black md:text-xl text-gray-600`}
        >
          ubb-jg-l-0985
        </Link>
        <Link
          href="/items/ubb-ms-0008"
          className={`text-lg hover:text-black md:text-xl text-gray-600`}
        >
          ubb-ms-0008
        </Link>
        <Link
          href="/samla-collections"
          className={`text-lg hover:text-black md:text-xl text-gray-600`}
        >
          SAMLA Collections
        </Link>
        <a
          href="https://search-prototype-one.vercel.app/search"
          className={`text-lg hover:text-black md:text-xl text-gray-600`}
        >
          Search
        </a>
      </div>

      <div style={{ padding: '1rem' }}>
        <ManifestViewer
          id={data}
          options={{
            canvasHeight: '60vh',
            renderAbout: false,
            showIIIFBadge: false,
            showTitle: false,
            showInformationToggle: false,
          }}
        />
        <IIIFMetadata label={data.label} summary={data.summary} metadata={data.metadata} />

        {/* <ul>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </ul> */}
      </div>
    </div>
  )
}

export default SamlaRecord