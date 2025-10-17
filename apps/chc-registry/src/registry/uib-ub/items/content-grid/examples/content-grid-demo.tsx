import { Skeleton } from '@/components/ui/skeleton';
import { ContentGrid } from '../components/content-grid';
import { IIIFImage } from '../../iiif-image/components/iiif-image';
import { Comparison, ComparisonHandle, ComparisonItem } from '@/components/ui/shadcn-io/comparison';
import Image from 'next/image';

export default function ContentGridDemo() {
  return (
    <ContentGrid className='py-5 font-serif tracking-wide prose text-xl'>
      <h2 className='font-bold'>Content Grid</h2>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </p>

      <figure>
        <Skeleton className='content h-64 border rounded-md p-3'>Figure</Skeleton>
        <figcaption>
          <Skeleton className='caption rounded-md border p-3'>
            Caption
          </Skeleton>
        </figcaption>
      </figure>

      <h3 className='font-bold'>Reforandum</h3>
      <p>
        Unum dicam posidonium eu vix, sea eu ubique viderer civibus, oporteat signiferumque eos et. Scripta periculis ei eam, te pro movet reformidans. Pri posse graeco definitiones cu, id eam populo quaestio adipiscing, usu quod malorum te. Scripta periculis ei eam, te pro movet reformidans. Eos ex affert fabulas iudicabit, dolore ornatus instructior ex per. Accusam explicari sed ei. Scripta periculis ei eam, te pro movet reformidans.
      </p>

      <aside className='text-muted-foreground'>
        <strong>Aside.</strong> Scripta periculis ei eam, te pro movet reformidans.
      </aside>

      <figure>
        <IIIFImage className='h-96 border rounded-md' src='https://iiif.wellcomecollection.org/image/b29346423_0006.jp2/full/full/0/default.jpg' />

        <figcaption className='overflow-y-scroll max-h-96 text-muted-foreground'>
          <strong>Figcaption.</strong> Scripta periculis ei eam, te pro movet reformidans. Pri posse graeco definitiones cu, id eam populo quaestio adipiscing, usu quod malorum te. Scripta periculis ei eam, te pro movet reformidans. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </figcaption>
      </figure>

      <h4 className='font-bold'>Definitiones</h4>
      <p>
        Pri posse graeco definitiones cu, id eam populo quaestio adipiscing, usu quod malorum te. Scripta periculis ei eam, te pro movet reformidans.
      </p>

      <figure className='feature'>
        <Comparison className='aspect-1024/700 w-full'>
          <ComparisonItem position='left'>
            <Image
              src='https://data.ub.uib.no/files/bs/ubb/ubb-kk/ubb-kk-n/ubb-kk-n-360/ubb-kk-n-360-010/jpg/ubb-kk-n-360-010_md.jpg'
              alt='Item 1'
              width={1024}
              height={724}
              className='object-cover'
              unoptimized
            />
          </ComparisonItem>
          <ComparisonItem position='right'>
            <Image
              src='https://data.ub.uib.no/files/bs/ubb/ubb-kk/ubb-kk-n/ubb-kk-n-286/ubb-kk-n-286-102/jpg/ubb-kk-n-286-102_md.jpg'
              alt='Item 2'
              width={1024}
              height={707}
              className='object-cover'
              unoptimized
            />
          </ComparisonItem>
          <ComparisonHandle />
        </Comparison>
        <figcaption className='text-muted-foreground'>
          <strong>Figcaption.</strong> Pri posse graeco definitiones cu, id eam populo quaestio adipiscing, usu quod malorum te. Scripta periculis ei eam, te pro movet reformidans.
        </figcaption>
      </figure>

      <p>
        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </p>

      <div className='full bg-red-50 text-red-900 dark:bg-red-900 dark:text-red-50 grid grid-cols-1 @2xl:grid-cols-2 grid-rows-1 px-16 py-8 gap-0 @md:gap-12  rounded-md'>
        <div>
          <blockquote className='font-sans text-md @lg:text-xl text-red-950 dark:text-red-50'>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
          </blockquote>

          <p>– <cite>Herbrand Lavik</cite></p>
        </div>
        <Image
          src='https://data.ub.uib.no/files/bs/ubb/ubb-bs/ubb-bs-ok/ubb-bs-ok-09448/jpg/ubb-bs-ok-09448_md.jpg'
          alt='Herbrand Lavik'
          width={1024}
          height={707}
          className='object-cover'
          unoptimized
        />
      </div>
    </ContentGrid>

  );
}