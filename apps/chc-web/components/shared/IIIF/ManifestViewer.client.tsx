"use client"

import dynamic from 'next/dynamic'
import { Boundary } from '../Boundary'

const CloverIIIF = dynamic(() => import('@samvera/clover-iiif'), {
  ssr: false,
})

const ManifestViewer = (props: any) => {
  return (
    <Boundary color='blue' labels={['ManifestViewer']} size='small'>
      <div className='my-3 min-h-[70vh]'>
        <CloverIIIF {...props} />
      </div>
    </Boundary>
  )
}

export default ManifestViewer