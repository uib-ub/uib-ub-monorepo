import OpenAPIViewer from './OpenAPIViewer';

function ApiDoc() {
  return (
    <main className='min-h-screen py-20 flex flex-grow flex-col justify-center content-center'>
      <OpenAPIViewer url={'/openapi.json'} />
    </main>
  );
}

export default ApiDoc;