import { getTranslations } from 'next-intl/server';
import { getItemData } from 'lib/marcus/marcus.client';
import { ItemPage } from 'components/pages/item/ItemPage';

export default async function ItemRoute({
  params
}: {
  params: { locale: string, id: string }
}) {
  const t = await getTranslations('Item');
  const itemData = await getItemData(params.id);

  return (
    <div>
      <span className='block text-xs text-right'>{t('greeting')}</span>
      {/* @ts-expect-error Server Component */}
      <ItemPage data={itemData} locale={params.locale} />
    </div>
  );
}