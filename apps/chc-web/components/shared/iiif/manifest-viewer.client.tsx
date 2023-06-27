"use client"

import dynamic from 'next/dynamic'

const CloverIIIF = dynamic(() => import('@samvera/clover-iiif'), {
  ssr: false,
})

const ManifestViewer = (props: any) => {
  return (
    <CloverIIIF {...props} />
  )
}

export default ManifestViewer