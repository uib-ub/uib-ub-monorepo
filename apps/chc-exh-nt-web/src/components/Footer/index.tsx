import { useTranslations } from 'next-intl';
import { CMILogo, FrittOrdLogo, NCHSLogo, UIBUBLeftEngLogo, UIBUBLeftNorLogo } from 'tailwind-ui';

interface FooterProps {
  locale?: string;
}

export const Footer = ({ locale }: FooterProps) => {
  const t = useTranslations('Footer');

  return (
    <footer className='mt-16 pb-32'>
      <div className='flex flex-col items-center w-full'>
        <p className={`text-neutral-500 dark:text-neutral-300 font-light ${locale === 'ar' ? 'text-2xl' : 'text-md'}`}>
          {t('exhibitionBy')}
        </p>
        <div className='w-full md:max-w-[600px] self-center items-center content-center grid grid-cols-6 gap-x-10 gap-y-5'>
          <div className='col-span-6 grid grid-cols-8'>
            <div className='col-start-1 col-span-8 md:col-start-2 md:col-span-6'>
              {locale === 'no' ? (<UIBUBLeftNorLogo className='text-black dark:text-white h-auto w-auto' />) : null}
              {['en', 'ar'].includes(locale!) ? (<UIBUBLeftEngLogo className='text-black dark:text-white h-auto w-auto' />) : null}
            </div>
          </div>
          <div className='col-span-3 max-sm:col-span-4 max-sm:col-start-2'>
            <NCHSLogo className=' h-auto w-auto' />
          </div>
          <div className='col-span-3 max-sm:col-span-4 max-sm:col-start-2 sm:w-3/4 sm:ml-auto'>
            <CMILogo className='h-auto w-auto' />
          </div>

          <div className='col-span-6 mt-10 flex justify-center'>
            <p className={`text-neutral-500 dark:text-neutral-300 font-light ${locale === 'ar' ? 'text-2xl' : 'text-md'}`}>
              {t('supportedBy')}
            </p>
          </div>
          <div className='col-span-6 grid grid-cols-6'>
            <div className='col-start-2 col-span-4 md:col-start-3 md:col-span-2'>
              <FrittOrdLogo className='h-auto w-auto' />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
