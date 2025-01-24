import React from "react";

type Props = {
  children: React.ReactNode
  Logo?: React.FC<React.SVGProps<SVGSVGElement>>
  className?: string
}

export const HeaderShell: React.FC<Props> = ({ className, children }) => {
  return (
    <header className={`flex text-xs sm:text-md md:text-lg font-light md:rotate-180 md:mb-2 md:[writing-mode:vertical-rl] ${className} `}>
      {children}
    </header >
  );
};
