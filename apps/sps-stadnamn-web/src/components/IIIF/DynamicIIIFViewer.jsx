import React, { Suspense, useEffect, useRef, useState } from 'react';
import OpenSeadragon from 'openseadragon';
import { PiMagnifyingGlassPlusFill, PiInfoFill, PiInfo, PiMagnifyingGlassMinusFill, PiHouseFill, PiX, PiCornersOut} from 'react-icons/pi';
import IconButton from '../ui/icon-button';
//import Viewer from "@samvera/clover-iiif/viewer";

const DynamicIIIFViewer = ({ manifestId }) => {
  const viewerRef = useRef();
  const viewer = useRef();
  const [manifest, setManifest] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleCollapse = (value) => {
    setIsCollapsed(value);
    viewer.current.viewport.goHome()
  }

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
          fullPageButton: "full-screen-button-id",
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
    <div className='h-full w-full flex flex-col'>
    <div className='h-full w-full relative'>
    <div className='absolute bottom-0 flex z-[1000]'>
      <div className='flex gap-4 text-2xl bg-white border rounded-full border-neutral-400 p-2 px-4 my-2 mx-4 text-neutral-700'>
      <IconButton id="zoom-in-button-id" label="Zoom inn"><PiMagnifyingGlassPlusFill/></IconButton>
        <IconButton id="zoom-out-button-id"label="Zoom ut"><PiMagnifyingGlassMinusFill/></IconButton>
        <IconButton id="home-button-id" label="Nullstill zoom"><PiHouseFill/></IconButton>
        <IconButton id="full-screen-button-id" label="Fullskjerm"><PiCornersOut/></IconButton>

      </div>

      <div className='flex gap-4 text-2xl bg-white border rounded-full border-neutral-400 p-2 px-4 m-2 text-neutral-700'>
      <IconButton 
          label="info" 
          aria-controls="iiif_info" 
          aria-expanded={isCollapsed} 
          onClick={() => toggleCollapse(!isCollapsed)}>
            <span className='relative'>{isCollapsed ? <><PiX className='absolute'/> <PiInfo/></>: <PiInfoFill/>}</span>
        </IconButton>
      </div>

    </div>
      <div id="openseadragon-viewer" ref={viewerRef} style={{ width: '100%', height: '100%' }}></div>
    </div>
    { manifest && isCollapsed ?

        <aside id="iiif_info" className='space-y-2 text-sm text-gray-800 p-4'>
          <div className="flex justify-between pb-2"><h2 className='text-xl font-bold'> Seddel: {manifest.label?.none[0]}</h2>
          <IconButton label="Lukk" className='right-0 top-0 text-2xl' onClick={() => toggleCollapse(false)}><PiX/></IconButton>
          </div>
        {manifest.metadata.map((item, index) => (
          <p key={index} className='flex justify-between'>
            <span className='font-semibold'>{item.label?.no?.[0] || item.label?.nb?.[0]}:</span>
            <span>{item.value?.none?.[0]}</span>
          </p>
        ))}
      </aside>
    : null
    }
    </div>
    
  );
};

export default DynamicIIIFViewer;

