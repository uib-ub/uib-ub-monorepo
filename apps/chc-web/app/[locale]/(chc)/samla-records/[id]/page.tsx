import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { getSamlaIIIFv2RecordData } from 'lib/samla/samla.client';
import { SamlaRecordPage } from 'components/pages/items/samla-record-page';

export default async function SamlaRecordRoute({
  params
}: {
  params: { locale: string, id: string }
}) {
  const t = await getTranslations('Item');
  const itemData = await getSamlaIIIFv2RecordData(params.id);

  if (!itemData) {
    notFound();
  }

  return (
    <div>
      <span className='block text-xs text-right'>{t('greeting')}</span>
      {/* @ts-expect-error Server Component */}
      <SamlaRecordPage data={itemData} locale={params.locale} />
    </div>
  );
}