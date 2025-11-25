import Studio from './studio'

export const dynamic = 'force-static'

export { metadata } from 'next-sanity/studio'

export default function StudioPage() {
  return <Studio />
}