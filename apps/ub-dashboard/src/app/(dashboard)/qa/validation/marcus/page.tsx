export const dynamic = 'force-static'

import * as jsonld from 'jsonld';
import { MainShell } from '@/components/main-shell';
import { ShaclResultCard } from './shacl-result-card';

const fileUrl = 'https://ubbdev.gitlab.io/ubbont-repository/shacl/marcus.ttl';
const apiUrl = 'https://sparql.ub.uib.no/sparql/shacl?graph=union';

async function getValidationReport(api: string, file: string): Promise<any> {
  'use server'
  return fetch(file, { next: { revalidate: 3600 } })
    .then(response => response.blob())
    .then(blob => {
      return fetch(api, {
        method: 'POST',
        body: blob,
        headers: {
          'Content-type': 'text/turle',
          'Accept': 'application/ld+json', // Replace with the desired content type
        },
      });
    })
    .then(async (response) => {
      if (response.ok) {
        try {
          const json = await JSON.parse(await response.text() ?? '');
          const framed = await jsonld.frame(json, {
            "@context": ["https://api-ub.vercel.app/ns/shacl/context.json"],
            "@type": "ValidationReport",
            "@embed": "@always",
          })
          return framed;
        } catch (e) {
          console.error('JSONLD framing error:', e);
        }
      } else {
        console.error('Failed to upload file', response.status, response.statusText);
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

export default async function ShaclPage() {
  const data = await getValidationReport(apiUrl, fileUrl);

  return (
    <MainShell>
      <div className='flex text-2xl items-baseline gap-4 mb-10'>
        <h1>Validering av Marcus datasett</h1>
      </div>
      <div className='flex flex-col items-baseline gap-8 mb-2 overflow-hidden'>
        {data?.result?.map((result: any, i: number) => (
          <ShaclResultCard key={i} data={result} />
        ))}
      </div>
    </MainShell >
  );
}