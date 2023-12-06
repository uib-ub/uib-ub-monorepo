export const revalidate = 30;

import { Suspense } from 'react';
import Links from './links';
import { MainShell } from '@/components/main-shell';
import { Button } from '@/components/ui/button';
import { createShortLink } from '@/actions/link-action';
import { CreateShortLinkForm } from '@/components/forms/create-short-link-form';


export default async function LinkShortenerPage() {
  return (
    <MainShell>
      <h1>
        Kortlenker
      </h1>

      <div className='flex items-end justify-end my-4 gap-4'>
        <div className='font-bold mb-1.5'>Lag ny kortlenke</div>
        <CreateShortLinkForm />
      </div>

      <Suspense fallback={<p>Loading links...</p>}>
        <Links />
      </Suspense>
    </MainShell>
  )
}
