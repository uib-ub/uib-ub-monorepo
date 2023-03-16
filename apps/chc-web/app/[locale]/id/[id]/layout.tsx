import 'styles/index.css'

import { Footer } from 'components/global/Footer'
import { Navbar } from 'components/global/Navbar'
import { PreviewBanner } from 'components/preview/PreviewBanner'
import { getSettings } from 'lib/sanity/sanity.client'
import { getPreviewToken } from 'lib/sanity/sanity.server.preview'

export default async function IDRoute({
  children,
}: {
  children: React.ReactNode
}) {
  const token = getPreviewToken()
  const settings = (await getSettings({ token })) || {
    menuItems: [],
    footer: [],
  }

  return (
    <div className="border border-red-500">{children}</div>
  )
}
