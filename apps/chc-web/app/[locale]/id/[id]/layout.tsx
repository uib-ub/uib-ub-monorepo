import { Boundary } from 'components/shared/Boundary'
import { getSettings } from 'lib/sanity/sanity.client'
import { getPreviewToken } from 'lib/sanity/sanity.server.preview'

export default async function ItemRoute({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <Boundary color='cyan' labels={['InternationalLabel']} size='small'>
      {children}
    </Boundary>

  )
}
