import { getTranslations } from 'next-intl/server';
import { getItemData } from 'lib/marcus/marcus.client';
import { ItemPage } from 'components/pages/item/ItemPage';

export default async function ItemRoute({
  params
}: {
  params: { id: string }
}) {
  const t = await getTranslations('Item');
  const itemData = await getItemData(params.id);

  return (
    <div>
      <h1>{t('title')}</h1>
      <ItemPage data={itemData} />
    </div>
  );
}