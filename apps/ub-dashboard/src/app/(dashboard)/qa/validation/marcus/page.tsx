import * as jsonld from 'jsonld';
import { MainShell } from '@/components/main-shell';
import { Badge } from '@/components/ui/badge';
import { MdWarningAmber } from 'react-icons/md';
import Link from 'next/link';
import { ArrowRightIcon, ExternalLinkIcon } from '@radix-ui/react-icons';
import { GrInspect } from 'react-icons/gr';

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
            "@context": "http://localhost:3002/context/shacl-context.json",
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

const formatMessage = (message: string) => {
  if (message.startsWith('Closed')) {
    /* message = message.replace('Closed', '')
    const closedProps = message.split(']')[0]
    const errorProps = message.split(']')[1].split(' : ')[0]
    const closedObject = message.split(']')[1].split(' : ')[1]

    return [closedProps + ']', errorProps, closedObject] */
    return ['Har properties som ikke er definert i skjemaet.']
  }
  return [message]
}

export default async function ShaclPage() {
  const data = await getValidationReport(apiUrl, fileUrl);

  return (
    <MainShell>
      <div className='flex text-2xl items-baseline gap-4 mb-10'>
        <h1>Validering av Marcus datasett</h1>
      </div>
      <div className='flex flex-col items-baseline gap-8 mb-2 overflow-hidden'>
        {data.result?.map((result: any, i: number) => (
          <div key={i} className='font-mono rounded-sm border overflow-hidden w-full'>
            <div className='flex align-top overflow-hidden'>
              <Badge variant={'destructive'} className='rounded-none'><MdWarningAmber className='mr-1' /> {result.resultSeverity}</Badge>
              <Badge className='rounded-none'><ArrowRightIcon className='mr-1' /> {result.resultPath}</Badge>
              <Badge variant={'secondary'} className='rounded-none ml-auto'><GrInspect className='mr-1 text-red-400' /> {result.sourceConstraintComponent}</Badge>
            </div>
            <div className='p-3'>
              <h2 className='font-bold text-sm sm:text-xl'>
                <Link className='underline underline-offset-2 flex items-baseline gap-2' href={result.focusNode.replace('data.ub', "marcus")} target='_blank'>{result.focusNode.replace('data.ub', "marcus")} <ExternalLinkIcon /></Link>
              </h2>
            </div>
            <div className='text-sm sm:text-md px-3'>
              {formatMessage(result.resultMessage).map((message: string, i: number) => (
                <p key={i} className='text-xs sm:text-sm'>{message}</p>
              )
              )}
            </div>
            <div className="flex justify-between pt-2">
              <Badge variant={'secondary'} className='rounded-none ml-auto font-light'>
                {result.focusNode}
              </Badge>
            </div>
          </div>
        ))}
      </div>
      {/* <pre className='text-xs'>{JSON.stringify(data, null, 2)}</pre> */}
    </MainShell>
  );
}