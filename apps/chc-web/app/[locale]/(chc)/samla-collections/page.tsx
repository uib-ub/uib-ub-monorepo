import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { getSamlaIIIFv1TopCollectionData } from 'lib/samla/samla.client';
import { pickSegmentFromEndOfUrl } from 'utils';

export default async function TopCollectionsRoute() {
  const t = await getTranslations('SamlaTopCollection');
  const data = await getSamlaIIIFv1TopCollectionData();

  if (!data) {
    notFound();
  }

  return (
    <div>
      <h1 className='text-4xl font-black mb-10'>{t('title')}</h1>
      <ul>
        {data.members?.map((member: any) => (
          <li key={member['@id']}>
            <a href={`/samla-collections/${pickSegmentFromEndOfUrl(member['@id'])}`}>{member.label[1]['@value']}</a>
          </li>
        ))}

      </ul>
    </div>
  );
}