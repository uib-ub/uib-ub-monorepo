import { NextApiRequest, NextApiResponse } from 'next';
import httpProxyMiddleware from 'next-http-proxy-middleware';

export const config = {
  api: {
    externalResolver: true,
  },
}

// eslint-disable-next-line import/no-anonymous-default-export
export default (req: NextApiRequest, res: NextApiResponse) => (
  /* @ts-ignore */
  httpProxyMiddleware(req, res, {
    target: 'https://cdn.sanity.io',
    changeOrigin: true,
    pathRewrite: [{
      patternStr: '^/api/image/',
      replaceStr: '/'
    }],
  })
);

