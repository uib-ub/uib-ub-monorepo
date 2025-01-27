'use client';

import { useParams } from 'next/navigation';
import React, { ReactNode, useTransition } from 'react';
import { usePathname, useRouter } from '../i18n/navigation';
import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";

type Props = {
  children: ReactNode;
  defaultValue: string;
  label: string;
  layout: 'sidebar' | 'header';
};

export default function LocaleSwitcherSelect({
  children,
  label,
  layout
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();

  function onLocaleSelect(nextLocale: string) {
    startTransition(() => {
      router.replace(
        pathname,
        { locale: nextLocale }
      );
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          disabled={isPending}
        >
          <GlobeAltIcon className="h-4 w-4" />
          <span className="sr-only">{label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side={layout === 'sidebar' ? 'right' : 'bottom'}>
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return (
              <DropdownMenuItem
                onClick={() => onLocaleSelect(child.props.value as string)}
              >
                {child.props.children}
              </DropdownMenuItem>
            );
          }
          return null;
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}