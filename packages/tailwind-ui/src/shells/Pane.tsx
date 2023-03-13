import React, { ReactNode } from 'react';
import { cva, VariantProps } from "class-variance-authority";

export const paneStyles = cva([], {
  variants: {
    intent: {
      sidebar: [
        "h-screen",
        "max-sm:h-fit",
        "sticky",
        "flex",
        "sm:flex-col",
        "gap-2",
        "sm:gap-5",
        "items-center",
        "shrink-0",
        "top-0",
        "z-20",
        "p-2",
        "max-sm:pt-2",
        "max-md:pt-4",
        "max-sm:border-b",
        "border-r",
        "border-neutral-200",
        "dark:border-neutral-800",
        "shadow-lg",
        "max-sm:w-full",
        "bg-white",
        "dark:bg-[#1a1d1e]"
      ],
      aside: [
        "max-md:flex",
        "md:flex",
        "flex-col",
        "gap-5",
        "p-3",
        "pb-1",
        "md:p-5",
        "md:pb-2",
        "md:h-screen",
        "md:sticky",
        "md:top-0",
        "sm:w-full",
        "md:w-64",
        "lg:w-80",
        "xl:w-96",
        "md:shrink",
        "md:flex-grow-0",
        "max-sm:p-5",
        "border-r",
        "border-neutral-200",
        "dark:border-neutral-800",
        "shadow-lg",
        "md:bg-neutral-50",
        "md:dark:bg-[#2b2e2f]",
      ],
      content: [
        "md:min-h-screen",
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
  children?: ReactNode
}

interface Props extends PaneProps, VariantProps<typeof paneStyles> { }

export const Pane = ({ intent, padded, children }: Props) => {
  return (
    <div className={paneStyles({ intent, padded })}>
      {children}
    </div>
  );
};