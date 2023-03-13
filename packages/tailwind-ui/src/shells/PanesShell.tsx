import React, { ReactNode } from 'react';

type Props = {
  children?: ReactNode
  className?: string
}

export const PanesShell: React.FC<Props> = ({ children }) => {
  return (
    <div className='flex max-sm:flex-col'>
      {children}
    </div>
  );
};
