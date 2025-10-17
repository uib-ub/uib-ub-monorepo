'use client';

import * as React from 'react';

import { Index } from '@/__registry__';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../ui/resizable';

export const ComponentPreview: React.FC<{ name: string, resizeable?: boolean }> = ({ name, resizeable = false }) => {
  const Preview = React.useMemo(() => {
    const Component = Index[name]?.component;
    return <Component />;
  }, [name]);

  if (resizeable) {
    return (
      <div className='flex items-center justify-center bg-card rounded-lg border min-h-96'>
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={100}>
            <React.Suspense
              fallback={
                <div className='text-muted-foreground flex items-center justify-center text-sm'>
                  Loading...
                </div>
              }
            >
              {Preview}
            </React.Suspense>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel />
        </ResizablePanelGroup>
      </div>
    );
  }
  return (
    <div className='flex items-center justify-center bg-card rounded-lg border'>
      <React.Suspense
        fallback={
          <div className='text-muted-foreground flex items-center justify-center text-sm'>
            Loading...
          </div>
        }
      >
        {Preview}
      </React.Suspense>
    </div>
  );
};
