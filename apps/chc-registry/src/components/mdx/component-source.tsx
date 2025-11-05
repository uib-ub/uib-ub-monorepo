'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';

import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock';

export const ComponentSource: React.FC<{ name: string }> = ({ name }) => {
  const Dynamic = React.useMemo(() => {
    return dynamic(
      () =>
        import('@/__registry__').then(({ Index }) => {
          const value = Index[name]?.files?.[0]?.content;
          const Code = () =>
            value ? <DynamicCodeBlock lang="tsx" code={value} /> : null;
          Code.displayName = 'ComponentSourceCode';
          return Code;
        }),
      {
        ssr: false,
        loading: () => null,
      },
    );
  }, [name]);

  return <Dynamic />;
};

ComponentSource.displayName = 'ComponentSource';
