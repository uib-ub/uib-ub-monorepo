import Link from 'next/link';
import { Button, ButtonProps } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FaEllipsisV } from 'react-icons/fa';
import { LockClosedIcon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';

export const ItemContextMenu = (props: ButtonProps) => {
  const { id, className } = props;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="link" aria-label='Open menu' className={cn(className)}>
          <FaEllipsisV />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="">
        <DropdownMenuLabel>
          <Link href={`/studio/desk/intent/edit/id=${id}`} target={'_blank'} rel={'noreferrer'}>
            Redigér i studio
          </Link>
          <p className='flex gap-1 mt-2 text-xs text-gray-500'><LockClosedIcon /> Krever administrator rolle</p>
        </DropdownMenuLabel>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
