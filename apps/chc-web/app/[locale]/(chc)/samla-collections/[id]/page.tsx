import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { getSamlaIIIFv1CollectionData } from 'lib/samla/samla.client';
import { pickSegmentFromEndOfUrl } from 'utils';
import Link from 'next-intl/link';

export default async function CollectionRoute({
  params
}: {
  params: { locale: string, id: string }
}) {
  console.log("🚀 ~ file: page.tsx:12 ~ id:", params.id)
  const t = await getTranslations('SamlaCollection');
  const data = await getSamlaIIIFv1CollectionData(params.id.replace('-', '.'));

  if (!data) {
    notFound();
  }

  return (
    <div>
      <h1 className='text-4xl font-black mb-10'>{t('title')}</h1>
      {/* <ul>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </ul> */}
      <ul>
        {data.members?.map((member: any) => {
          const id = member['@id'].includes('record') ? pickSegmentFromEndOfUrl(member['@id'], -1) : pickSegmentFromEndOfUrl(member['@id']);
          const path = member['@id'].includes('record') ? 'samla-records' : 'samla-collections';
          const type = member['@type'] === 'sc:Manifest' ? 'Record' : 'Collection';

          return (
            <li key={member['@id']}>
              {type} – <Link href={`/${path}/${id.replace('.', '-')}`}>{member.label?.[1]?.['@value'] ?? member.label}</Link>
            </li>
          )
        })}
      </ul>
    </div>
  );
}