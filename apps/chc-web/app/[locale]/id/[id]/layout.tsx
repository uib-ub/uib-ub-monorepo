import { getSettings } from 'lib/sanity/sanity.client'
import { getPreviewToken } from 'lib/sanity/sanity.server.preview'

export default async function ItemRoute({
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
    <div className="ring-2 ring-offset-8 ring-magenta-600 rounded-sm before:content-['ItemRouteLayout'] before:relative before:bg-white before:-top-[22px] before:px-2">{children}</div>
  )
}
