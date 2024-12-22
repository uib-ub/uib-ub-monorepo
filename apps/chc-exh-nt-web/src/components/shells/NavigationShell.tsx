import React, { ReactNode } from 'react';

type Props = {
  children?: ReactNode
  className?: string
}

export const NavigationShell: React.FC<Props> = ({ className = '', children }) => {

  return (
    <nav className={`${className} flex flex-col gap-5 items-center`}>
      {children}
    </nav>
  );
};
