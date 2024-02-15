import React, { useEffect, useRef, useState } from 'react';
import OpenSeadragon from 'openseadragon';
import { PiMagnifyingGlassPlusFill } from 'react-icons/pi';
import { PiMagnifyingGlassMinusFill } from 'react-icons/pi';
import { PiHouseFill } from 'react-icons/pi';
import IconButton from '../ui/icon-button';
//import Viewer from "@samvera/clover-iiif/viewer";

const DynamicIIIFViewer = ({ manifestId }) => {
  const viewerRef = useRef();
  const viewer = useRef();
  const [manifest, setManifest] = useState(null);

  useEffect(() => {
    const fetchManifestAndInitializeViewer = async () => {
      const response = await fetch(`https://iiif.test.ubbe.no/iiif/manifest/${manifestId}.json`);
      const manifest = await response.json();
      setManifest(manifest);

      const firstImageService = manifest.items[0].items[0].items[0].body;
      const tileSources = {
        "@context": "http://iiif.io/api/image/2/context.json",
        "@id": firstImageService.id,
        "height": firstImageService.height,
        "width": firstImageService.width,
        "profile": [ "http://iiif.io/api/image/2/level2.json" ],
        "protocol": "http://iiif.io/api/image",
        "tiles": [{
          "scaleFactors": [ 1, 2, 4, 8, 16, 32 ],
          "width": 1024
        }]
      }

      if (!viewer.current) {
        viewer.current = OpenSeadragon({
          id: "openseadragon-viewer",
          prefixUrl: "path/to/openseadragon/images/",
          maxZoomPixelRatio: 3.0,
          zoomInButton: "zoom-in-button-id",
          zoomOutButton: "zoom-out-button-id",
          homeButton: "home-button-id",
          tileSources
        });
      } else {
        viewer.current.open(tileSources);
        viewer.current.viewport.goHome();
      }
    };

    fetchManifestAndInitializeViewer();
  }, [manifestId]);

  return (
    
    <div className='h-full w-full relative'>
    <div className='absolute bottom-0 left-[50%] flex gap-4 text-2xl bg-white border rounded-sm border-neutral-400 p-2 px-4 m-1 text-primary-600 z-[1000]'>
        <IconButton id="zoom-in-button-id" label="Zoom inn"><PiMagnifyingGlassPlusFill/></IconButton>
        <IconButton id="zoom-out-button-id"label="Zoom ut"><PiMagnifyingGlassMinusFill/></IconButton>
        <IconButton id="home-button-id" label="Nullstill zoom"><PiHouseFill/></IconButton>
    </div>

      <div id="openseadragon-viewer" ref={viewerRef} style={{ width: '100%', height: '100%' }}></div>
    </div>
    
  );
};

export default DynamicIIIFViewer;

