import { Button } from '../components/button';
import { ArrowRightIcon, ArrowUpRightIcon, SearchIcon } from 'lucide-react';

export default function ButtonDemo() {
  return (
    <div className='flex flex-column flex-wrap gap-5 m-5'>
      <div className='flex flex-row flex-wrap gap-5 w-full'>
        <Button>Primary button</Button>
        <Button>
          <ArrowRightIcon className='size-5' />
          Link button
        </Button>
        <Button>
          Link button
          <ArrowUpRightIcon className='size-5' />
        </Button>
        <Button variant='secondary'>Secondary button</Button>
        <Button variant='outline'>Outline</Button>
        <Button variant='ghost'>Ghost</Button>
        <Button variant='link'>Link</Button>
        <Button variant='destructive'>Destructive</Button>
      </div>
      <div className='flex flex-row flex-wrap gap-5 w-full'>
        <Button size='icon-xs'><SearchIcon /></Button>
        <Button size='icon-sm'><SearchIcon className='size-3' /></Button>
        <Button size='icon'><SearchIcon className='size-4' /></Button>
        <Button size='icon-lg'><SearchIcon className='size-5' /></Button>
      </div>
      <div className='flex flex-row flex-wrap gap-5 w-full'>
        <Button size='xs'>Extra Small</Button>
        <Button size='sm'>Small</Button>
        <Button>Default</Button>
        <Button size='lg'>Large</Button>
      </div>
    </div>
  );
}