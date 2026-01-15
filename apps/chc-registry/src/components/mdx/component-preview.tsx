'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../ui/resizable';

export const ComponentPreview: React.FC<{ name: string, resizeable?: boolean }> = ({ name, resizeable = false }) => {
  const DynamicComponent = React.useMemo(() => {
    return dynamic(
      async () => {
        const { Index } = await import('@/__registry__');
        const Lazy = Index[name]?.component as React.LazyExoticComponent<React.ComponentType> | undefined;

        const Wrapped: React.FC = () => {
          if (!Lazy) {
            return (
              <div className='text-muted-foreground flex items-center justify-center text-sm'>
                Component not found
              </div>
            );
          }
          return (
            <React.Suspense
              fallback={
                <div className='text-muted-foreground flex items-center justify-center text-sm'>
                  Loading...
                </div>
              }
            >
              <Lazy />
            </React.Suspense>
          );
        };
        Wrapped.displayName = `ComponentPreviewWrapped(${name})`;
        return Wrapped;
      },
      {
        ssr: false,
        loading: () => (
          <div className='text-muted-foreground flex items-center justify-center text-sm'>
            Loading...
          </div>
        ),
      },
    );
  }, [name]);

  if (resizeable) {
    return (
      <div className='flex items-center justify-center bg-card rounded-lg border min-h-96'>
        <ResizablePanelGroup orientation="horizontal">
          <ResizablePanel defaultSize={100}>
            <DynamicComponent />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={0} minSize={0} />
        </ResizablePanelGroup>
      </div>
    );
  }

  return (
    <div className='flex items-center justify-center bg-card rounded-lg border'>
      <DynamicComponent />
    </div>
  );
};

ComponentPreview.displayName = 'ComponentPreview';
