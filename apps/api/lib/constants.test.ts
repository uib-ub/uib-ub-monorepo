import { getBaseUrl } from './constants';

describe('getBaseUrl', () => {
  it('should return the production URL when in production environment', () => {
    process.env.VERCEL_ENV = 'production';
    process.env.NEXT_PUBLIC_PUBLIC_DOMAIN = 'example.com';
    expect(getBaseUrl()).toBe('https://example.com');
  });

  it('should return the preview URL when in preview environment', () => {
    process.env.VERCEL_ENV = 'preview';
    process.env.VERCEL_URL = 'example-preview.vercel.app';
    expect(getBaseUrl()).toBe('https://example-preview.vercel.app');
  });

  it('should return the local URL when in development environment', () => {
    process.env.VERCEL_ENV = undefined;
    expect(getBaseUrl()).toBe('http://localhost:3009');
  });
});