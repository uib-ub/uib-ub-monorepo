export const revalidate = 30;

import { CreateShortLinkForm } from '@/components/forms/create-short-link-form';
import { MainShell } from '@/components/shared/main-shell';
import { Suspense } from 'react';
import Links from './links';

export default async function LinkShortenerPage() {
  return (
    <MainShell>
      <h1>
        Kortlenker
      </h1>

      <p className='max-w-prose my-4'>
        Her kan du lage kortlenker som peker til andre lenker, samt lage en QR kode. Kortlenker kan ikke slettes etter de er laget, så vær sikker på at du skriver riktig lenke :-).
      </p>

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
