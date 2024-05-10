import { draftMode } from 'next/headers';

export const runtime = 'edge'

export function GET(req: Request) {
  /* if (req.headers.get('origin') !== new URL(req.url).origin) {
    return new Response('Invalid origin', { status: 400 });
  } */
  const referrer = req.headers.get('Referer');
  if (!referrer) {
    return new Response('Missing Referer', { status: 400 });
  }
  draftMode().disable();
  return Response.redirect(referrer, 303);
}