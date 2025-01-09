import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const OpenAPIViewer = dynamic(() => import('./OpenAPIViewer'), {
  ssr: false,  // Disable server-side rendering for this component
});

function ApiDoc() {
  return (
    <main className='min-h-screen py-20 flex flex-grow flex-col justify-center content-center'>
      <Suspense fallback={<div>Loading API documentation...</div>}>
        <OpenAPIViewer url={'/openapi.json'} />
      </Suspense>
    </main>
  );
}

export default ApiDoc;