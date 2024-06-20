import React, { ReactNode } from "react";

export interface ButtonProps {
  children: ReactNode
}

export const Button: React.FC<ButtonProps> = ({ children }) => {
  return (
    <div className={`inline-flex rounded-md border border-neutral-600 dark:border-neutral-300 dark:text-white px-8 py-1 font-sans font-medium no-underline md:py-2 md:px-8 md:text-lg`}>
      {children}
    </div>
  );
};
