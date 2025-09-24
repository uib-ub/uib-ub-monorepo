import { Button } from '../components/button';
import { PlusIcon } from 'lucide-react';

export default function ButtonDemo() {
  return (
    <div className='flex flex-row flex-wrap gap-5 justify-center'>
      <Button>Default</Button>
      <Button variant='destructive'>Destructive</Button>
      <Button variant='outline'>Outline</Button>
      <Button variant='secondary'>Secondary</Button>
      <Button variant='ghost'>Ghost</Button>
      <Button variant='link'>Link</Button>
      <Button size='sm'>Small</Button>
      <Button size='lg'>Large</Button>
      <Button size='xl'>Extra Large</Button>
      <Button size='icon'><PlusIcon /></Button>
    </div>
  );
}