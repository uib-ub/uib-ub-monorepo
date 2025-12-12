import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'stadnamn.no',
    short_name: 'stadnamn.no',
    description: 'Språksamlinganes nasjonale søketeneste for stadnamn, utvikla ved Universitetsbiblioteket i Bergen',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-mask.png',
        sizes: '512x512',
        purpose: 'maskable',
        type: 'image/png',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
