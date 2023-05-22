import { Boundary } from 'components/shared/Boundary'

export default async function ItemRoute({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <Boundary color='cyan' labels={['ItemRoute (server)']} size='small'>
      {children}
    </Boundary>

  )
}
