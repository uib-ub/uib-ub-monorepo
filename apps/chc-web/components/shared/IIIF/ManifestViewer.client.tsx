"use client"

import dynamic from 'next/dynamic'
import { Boundary } from '../Boundary'

const CloverIIIF = dynamic(() => import('@samvera/clover-iiif'), {
  ssr: false,
})

const ManifestViewer = (props: any) => {
  return (
    <Boundary color='orange' labels={['ManifestViewer (client)']} size='small'>
      <CloverIIIF {...props} />
    </Boundary>
  )
}

export default ManifestViewer