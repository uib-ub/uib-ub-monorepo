import React, { ReactNode } from 'react';
import { cva, VariantProps } from "class-variance-authority";
import { cn } from '@/src/lib/utils';

export const paneStyles = cva([], {
  variants: {
    intent: {
      sidebar: [
        "h-fit",
        "md:h-screen",
        "sm:sticky",
        "flex",
        "flex-row",
        "md:flex-col",
        "gap-2",
        "sm:gap-5",
        "items-center",
        "shrink-0",
        "top-0",
        "z-20",
        "p-2",
        "max-md:pt-2",
        "max-sm:border-b",
        "border-r",
        "border-neutral-200",
        "dark:border-neutral-800",
        "shadow-lg",
        "max-md:w-full",
        "bg-white",
        "dark:bg-[#1a1d1e]"
      ],
      aside: [
        "flex",
        "flex-col",
        "gap-5",
        "p-5",
        "sm:h-screen",
        "md:sticky",
        "md:top-0",
        "overflow-y-auto",
        "grow-0",
        "max-md:w-full",
        "md:min-w-80",
        "md:max-w-112",
        "border-r",
        "border-neutral-200",
        "dark:border-neutral-800",
        "shadow-lg",
        "bg-neutral-100",
        "dark:bg-[#2b2e2f]",
      ],
      content: [
        "snap-y",
        "snap-mandatory",
        "min-h-screen",
        "flex",
        "flex-col",
        "flex-grow",
        "bg-neutral-200",
        "dark:bg-[#35393a]",
      ]
    },
    padded: {
      true: [
        "p-3",
        "md:p-5",
        "md:pb-2",
      ],
      false: [],
    },
  },
  defaultVariants: {
    intent: "content",
    padded: true
  },
});

type PaneProps = {
  children?: ReactNode;
  className?: string;
}

interface Props extends PaneProps, VariantProps<typeof paneStyles> { }

export const Pane = ({ intent, padded, className, children }: Props) => {
  return (
    <div className={cn(paneStyles({ intent, padded }), className)}>
      {children}
    </div>
  );
};