"use client"

import dynamic from 'next/dynamic'

const CloverIIIF = dynamic(() => import('@samvera/clover-iiif'), {
  ssr: false,
})

const ManifestViewer = (props: any) => {
  return (
    <CloverIIIF
      options={{
        canvasBackgroundColor: '#222',
        canvasHeight: '70vh',
        renderAbout: false,
        showIIIFBadge: false,
        showTitle: false,
        showInformationToggle: false,
        openSeadragon: {
          gestureSettingsMouse: {
            scrollToZoom: false,
          },
        },
      }}
      {...props}
    />
  )
}

export default ManifestViewer