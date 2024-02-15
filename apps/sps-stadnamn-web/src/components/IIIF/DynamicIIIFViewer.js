import Viewer from "@samvera/clover-iiif/viewer";

const DynamicIIIFViewer = ({ manifestId }) => {

  return (

      <Viewer 
        iiifContent={`https://iiif.test.ubbe.no/iiif/manifest/${manifestId}.json`}
        options={{
        }}
        
        />
  )
}

export default DynamicIIIFViewer;

