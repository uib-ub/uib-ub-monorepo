import { useRouter } from 'next/router';
import React, { ReactNode } from 'react';
import { AppShell, HeaderShell, LocaleSwitch, Modal, Pane, PanesShell, ThemeSwitch } from '..';

type Props = {
  children?: ReactNode
  title?: React.ReactElement
  icon: React.ReactElement
  nav: React.ReactElement
  data: string
}

export const Layout: React.FC<Props> = ({ children, data, title, icon, nav }) => {
  const { locale, locales, defaultLocale, asPath } = useRouter()
  return (
    <AppShell>
      <PanesShell>
        <Pane intent='sidebar' padded={false}>
          {nav}

          <div className='grow' aria-hidden>&nbsp;</div>
          <HeaderShell>
            {title}
          </HeaderShell>

          <div className='flex sm:flex-col'>
            <LocaleSwitch
              lite={true}
              labels={{
                no: 'Norsk',
                en: 'English',
                ar: 'Arabic',
              }}
            />
            <ThemeSwitch lite={true} />
          </div>

          {icon}
        </Pane>

        {children}
      </PanesShell>

      {process.env.NODE_ENV === 'development' && (
        <div className='hidden'>
          <Modal buttonLabel="Data" title="Data" accessKey='i'>
            <pre className='text-xs max-h-[70vh] overflow-scroll border p-3'>
              {JSON.stringify(data, null, 2)}
            </pre>
          </Modal>
        </div>
      )}
    </AppShell>
  );
};
