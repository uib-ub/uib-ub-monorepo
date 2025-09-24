import { Skeleton } from '@/components/ui/skeleton';
import { ContentGrid } from '../components/content-grid';
import { IIIFImage } from '../../iiif-image/components/iiif-image';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

export default function ContentGridDemo() {
  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel defaultSize={100}>
        <ContentGrid className='py-5 font-serif tracking-wide prose text-xl'>
          <h2 className='font-bold'>Content Grid</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>

          <div className='feature'>
            <Skeleton className='img h-96 border rounded-md p-3'>Figure</Skeleton>
            <Skeleton className='caption rounded-md border p-3'>
              Caption
            </Skeleton>
          </div>

          <h3 className='font-bold'>Content Grid</h3>
          <p>
            Unum dicam posidonium eu vix, sea eu ubique viderer civibus, oporteat signiferumque eos et. Scripta periculis ei eam, te pro movet reformidans. Pri posse graeco definitiones cu, id eam populo quaestio adipiscing, usu quod malorum te. Scripta periculis ei eam, te pro movet reformidans. Eos ex affert fabulas iudicabit, dolore ornatus instructior ex per. Accusam explicari sed ei. Scripta periculis ei eam, te pro movet reformidans.
          </p>

          <aside className='text-muted-foreground'>
            Scripta periculis ei eam, te pro movet reformidans.
          </aside>

          <figure>
            <IIIFImage className='h-96 border rounded-md' src='https://iiif.wellcomecollection.org/image/b29346423_0006.jp2/full/full/0/default.jpg' />

            <figcaption className='overflow-y-scroll max-h-96 text-muted-foreground'>
              Scripta periculis ei eam, te pro movet reformidans. Pri posse graeco definitiones cu, id eam populo quaestio adipiscing, usu quod malorum te. Scripta periculis ei eam, te pro movet reformidans. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </figcaption>
          </figure>

          <p>
            Pri posse graeco definitiones cu, id eam populo quaestio adipiscing, usu quod malorum te. Scripta periculis ei eam, te pro movet reformidans.
          </p>
        </ContentGrid>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel />
    </ResizablePanelGroup>
  );
}