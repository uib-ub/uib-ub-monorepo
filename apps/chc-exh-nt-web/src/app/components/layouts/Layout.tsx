import React, { ReactNode } from 'react';
import { useRouter } from 'next/router';
import { AppShell } from '../shells/AppShell';
import { PanesShell } from '../shells/PanesShell';
import { Pane } from '../shells/Pane';
import { HeaderShell } from '../shells/HeaderShell';
import { Dialog, DialogTitle, DialogHeader, DialogContent, DialogTrigger } from '@/src/app/components/ui/dialog';
import { Button } from '@/src/app/components/ui/button';
import { ThemeSwitch } from '../ThemeSwitch';

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
            {/* <LocaleSwitch
              lite={true}
              labels={{
                no: 'Norsk',
                en: 'English'
              }}
            /> */}
            <ThemeSwitch />
          </div>

          {icon}
        </Pane>

        {children}
      </PanesShell>

      {process.env.NODE_ENV === 'development' && (
        <div className='hidden'>
          <Dialog>
            <DialogTrigger>
              <Button>Open</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you sure absolutely sure?</DialogTitle>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </AppShell>
  );
};
