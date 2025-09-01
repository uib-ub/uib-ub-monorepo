import { type Registry } from 'shadcn/registry';
import { ui } from './registry-ui';
import { examples } from './registry-examples';
import { blocks } from './registry-blocks';

export const registry = {
  name: 'chc-registry',
  homepage: 'https://chc-registry.vercel.app',
  items: [...ui, ...examples, ...blocks],
} satisfies Registry;
