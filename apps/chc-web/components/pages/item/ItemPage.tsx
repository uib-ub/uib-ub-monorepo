import ManifestViewer from 'components/shared/IIIF/ManifestViewer';

export function ItemPage({
  data
}: {
  data: any
}) {
  return (
    <div>
      <ManifestViewer
        id={data.subjectOfManifest}
        options={{
          canvasHeight: '70vh',
          /* renderAbout: false,
          showIIIFBadge: false,
          showTitle: false,
          showInformationToggle: false, */
        }}
      />
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}