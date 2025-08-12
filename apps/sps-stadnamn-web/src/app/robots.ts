import type { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/', '/view/*/info',
      disallow: ['/api', '/view/*'],
    }
  }
}
