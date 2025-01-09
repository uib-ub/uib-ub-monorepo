import React, { ReactNode } from 'react';

type Props = {
  children?: ReactNode
  className?: string
}

export const AppShell: React.FC<Props> = ({ children, className }) => {
  return (
    <div className={`${className}`}>
      {children}
    </div>
  );
};
