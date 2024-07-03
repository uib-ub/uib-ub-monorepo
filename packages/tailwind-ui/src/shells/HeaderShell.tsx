import React from "react";

type Props = {
  children: React.ReactNode
  Logo?: React.FC<React.SVGProps<SVGSVGElement>>
  className?: string
}

export const HeaderShell: React.FC<Props> = ({ Logo, className, children }) => {
  return (
    <header className={`flex text-sm font-light sm:rotate-180 sm:mb-2 sm:[writing-mode:vertical-rl] sm:rtl:[writing-mode:vertical-lr]  ${className} `}>
      {Logo ? (
        <div className='w-6 h-6'>
          <Logo />
        </div>
      ) : null}
      {children}
    </header >
  );
};
