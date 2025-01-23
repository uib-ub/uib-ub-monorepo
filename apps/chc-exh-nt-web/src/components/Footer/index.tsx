import { cn } from '@/src/lib/utils';
import { CmiEn, FrittOrd, NchEn, UibUbCenteredEn, UibUbCenteredNo } from 'assets';
import { getTranslations } from 'next-intl/server';


interface FooterProps {
  locale?: string;
  className?: string;
}

export async function Footer({ locale, className }: FooterProps) {
  const t = await getTranslations('Footer')
  return (
    <footer className={cn('w-full p-5 bg-neutral-300 dark:bg-neutral-600', className)}>
      <div className='flex md:flex-col flex-col items-center w-full'>
        <p className='text-neutral-500 dark:text-neutral-300 font-light text-lg'>
          {t('createdBy')}
        </p>
        <div className='w-full max-w-[900px] grid grid-cols-12 gap-8 mt-6'>
          <div className='col-span-12 md:col-span-8 md:col-start-3 flex justify-center'>
            {locale === 'no' ? (<UibUbCenteredNo className='text-black dark:text-white w-3/4' />) : null}
            {locale === 'en' ? (<UibUbCenteredEn className='text-black dark:text-white w-3/4' />) : null}
            {locale === 'ar' ? (<UibUbCenteredEn className='text-black dark:text-white w-3/4' />) : null}
          </div>
          <div className='col-span-12 md:col-span-6 flex justify-center'>
            <NchEn className='w-full max-w-[200px]' />
          </div>
          <div className='col-span-12 md:col-span-6 flex justify-center'>
            <CmiEn className='w-full max-w-[200px]' />
          </div>
          <div className='col-span-12 flex justify-center mt-10'>
            <p className='text-neutral-500 dark:text-neutral-300 font-light text-lg'>
              {t('supportedBy')}
            </p>
          </div>
          <div className='col-span-12 flex justify-center'>
            <div className='w-1/3'>
              <FrittOrd className='w-full' />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
