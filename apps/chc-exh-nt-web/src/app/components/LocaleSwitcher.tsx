import { useLocale, useTranslations } from 'next-intl';
import { routing } from '../../i18n/routing';
import LocaleSwitcherSelect from './LocaleSwitcherSelect';

export default function LocaleSwitcher({ layout }: { layout: 'sidebar' | 'header' }) {
  const t = useTranslations('LocaleSwitcher');
  const locale = useLocale();

  return (
    <LocaleSwitcherSelect defaultValue={locale} label={t('label')} layout={layout}>
      {routing.locales.map((cur) => (
        <option key={cur} value={cur} className='text-xs'>
          {t('locale', { locale: cur })}
        </option>
      ))}
    </LocaleSwitcherSelect>
  );
}