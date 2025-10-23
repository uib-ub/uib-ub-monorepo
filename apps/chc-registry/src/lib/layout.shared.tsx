import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: 'CHC Registry',
    },
    themeSwitch: {
      mode: 'light-dark-system'
    },
  };
}