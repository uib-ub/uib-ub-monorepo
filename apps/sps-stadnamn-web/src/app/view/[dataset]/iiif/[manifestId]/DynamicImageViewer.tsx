import React, { useEffect, useRef, useState } from 'react';
import OpenSeadragon from 'openseadragon';
import { PiMagnifyingGlassPlusFill, PiInfoFill, PiMagnifyingGlassMinusFill, PiHouseFill, PiX, PiCornersOut, PiXCircleFill, PiArrowLeft, PiArrowRight, PiCaretRightFill, PiCaretLeftFill } from 'react-icons/pi';
import IconButton from '../../../../../components/ui/icon-button';
import Spinner from '@/components/svg/Spinner';
import { useParams } from 'next/navigation';
//import Viewer from "@samvera/clover-iiif/viewer";

const DynamicImageViewer = () => {
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const viewer = useRef<OpenSeadragon.Viewer | null>(null);
  const [manifest, setManifest] = useState<any>(null);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [numberOfPages, setNumberOfPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const manifestId = useParams().manifestId;
  

  const toggleCollapse = (value: boolean | ((prevState: boolean) => boolean)) => {
    setIsCollapsed(value);
    if (viewer.current) {
      viewer.current.viewport.goHome()
    }
  }

  useEffect(() => {
    const fetchManifestAndInitializeViewer = async () => {
      setIsLoading(true);
      const response = await fetch(`https://iiif.test.ubbe.no/iiif/manifest/${manifestId}.json`);
      const manifestBody = await response.json();
      setManifest(manifestBody);
      setCurrentPage(0)

      const tileSources = manifestBody.items.map((item: { items: { items: { body: any; }[]; }[]; }) => {
        const imageService = item.items[0].items[0].body;
        return {
          "@context": "http://iiif.io/api/image/2/context.json",
          "@id": imageService.id,
          "height": imageService.height,
          "width": imageService.width,
          "profile": [ "http://iiif.io/api/image/2/level2.json" ],
          "protocol": "http://iiif.io/api/image",
          "tiles": [{
            "scaleFactors": [ 1, 2, 4, 8, 16, 32 ],
            "width": 1024
          }]
        };
      });

      setNumberOfPages(tileSources.length);

      if (!viewer.current) {
        viewer.current = OpenSeadragon({
          id: "openseadragon-viewer",
          prefixUrl: "path/to/openseadragon/images/",
          maxZoomPixelRatio: 3.0,
          zoomInButton: "zoom-in-button-id",
          zoomOutButton: "zoom-out-button-id",
          homeButton: "home-button-id",
          sequenceMode: true,
          nextButton: "next-button",
          previousButton: "previous-button",
          fullPageButton: "full-screen-button-id",
          tileSources
        });

        viewer.current.addHandler('page', function(event: { page: React.SetStateAction<number>; }) {
          setCurrentPage(event.page);
        });

        viewer.current.addHandler('open', function() {
          if (viewer.current) {
          viewer.current.addHandler('tile-drawing', function() {
            setIsLoading(false);
          });
          }
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
    {isLoading || !viewerRef.current? 
    <div className='absolute top-0 left-0 w-full h-full text-white bg-opacity-50 flex items-center justify-center z-[1000]'><Spinner className='w-20 h-20'/></div>
      : null
      }
    <div className='absolute bottom-0 flex z-[1000] flex gap-2 text-xl p-2 text-white w-full'>

      <IconButton id="zoom-in-button-id" className="p-2 rounded-full border bg-neutral-900 border-white shadow-sm" label="Zoom inn"><PiMagnifyingGlassPlusFill/></IconButton>
        <IconButton id="zoom-out-button-id" className="p-2 rounded-full border bg-neutral-900 border-white shadow-sm" label="Zoom ut"><PiMagnifyingGlassMinusFill/></IconButton>
        <IconButton id="home-button-id" className="p-2 rounded-full border bg-neutral-900 border-white shadow-sm" label="Nullstill zoom"><PiHouseFill/></IconButton>
        <IconButton id="full-screen-button-id" className="p-2 rounded-full border bg-neutral-900 border-white shadow-sm" label="Fullskjerm"><PiCornersOut/></IconButton>

 

    <div className="rounded-full border-white border bg-neutral-900 shadow-sm p-2 px-3 flex gap-2 absolute left-1/2 transform -translate-x-1/2">
        
          
    <IconButton 
      id="previous-button"
      label="Forrige side">
        <PiCaretLeftFill/>
    </IconButton>
  

  <span className='text-base'>side {`${currentPage + 1}/${numberOfPages}`}</span>

  
    <IconButton 
      id="next-button"
      label="Neste side">
        <PiCaretRightFill/>
    </IconButton>
  
  </div>
  <IconButton 
          label={isCollapsed ? "Skjul info" : "Vis info"}
          textClass="text-base"
          className="pl-3 pr-2 rounded-full border-white border bg-neutral-900 shadow-sm ml-auto flex gap-2 items-center"
          aria-controls="iiif_info" 
          aria-expanded={isCollapsed} 
          onClick={() => toggleCollapse(!isCollapsed)}>
            {isCollapsed ? <PiXCircleFill/>: <PiInfoFill/>}
  </IconButton>
  
    </div>
      <div id="openseadragon-viewer" ref={viewerRef} style={{ width: '100%', height: '100%' }}></div>
    </div>
    { manifest && isCollapsed ?

        <aside id="iiif_info" className='space-y-2 text-sm text-gray-800 p-4'>
          <h2 className='text-xl font-bold'> Seddel: {manifest.label?.none?.[0] || manifest.label?.nb?.[0] || manifest.label?.nn?.[0]}</h2>


        {manifest.metadata.map((item: Record<string, any>, index: number) => (
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

export default DynamicImageViewer;

