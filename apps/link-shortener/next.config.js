/** @type {import('next').NextConfig} */
export default {
  async rewrites() {
    return [
      {
        source: '/:path',
        destination: '/api/:path',
      },
    ]
  },
}
