export const revalidate = 30;

import { Suspense } from 'react';
import Links from './links';
import { MainShell } from '@/components/main-shell';
import { Button } from '@/components/ui/button';

export default async function LinkShortenerPage() {
  return (
    <MainShell>
        <h1>
          Kortlenker
        </h1>

        <div className='flex justify-end my-4'>
          <Button disabled>
            Ny kortlenke (kommer senere)
          </Button>
        </div>

        <Suspense fallback={<p>Loading links...</p>}>
          <Links />
        </Suspense>
    </MainShell>
  )
}
