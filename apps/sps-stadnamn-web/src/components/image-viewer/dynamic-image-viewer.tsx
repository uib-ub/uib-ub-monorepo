import React, { useEffect, useRef, useState } from 'react';
import OpenSeadragon from 'openseadragon';
import { PiMagnifyingGlassPlusFill, PiInfoFill, PiMagnifyingGlassMinusFill, PiHouseFill, PiCornersOut, PiXCircleFill, PiArrowLeft, PiArrowRight, PiCaretRightFill, PiCaretLeftFill, PiCaretLeftBold, PiXBold, PiWarning } from 'react-icons/pi';
import IconButton from '../ui/icon-button';
import Spinner from '@/components/svg/Spinner';
import { useParams, useSearchParams } from 'next/navigation';
import ErrorMessage from '../error-message';

const DynamicImageViewer = () => {
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const viewer = useRef<OpenSeadragon.Viewer | null>(null);
  const [manifest, setManifest] = useState<any>(null);
  const [numberOfPages, setNumberOfPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const {dataset, manifestId} = useParams();
  const [error, setError] = useState<any>(null);

  const params = useParams();
  const searchParams = useSearchParams();
  const hasSearchParams = searchParams.toString()
  


  useEffect(() => {
    const fetchManifestAndInitializeViewer = async () => {
      //setIsLoading(true);
      // TODO: create api route that generates manifest from elasticsearch index  
      let response 
      try {
        response = await fetch( `https://iiif.test.ubbe.no/iiif/manifest/${manifestId}.json`);
        if (response.status === 404) {
          throw new Error("Not found")
      }
      }
      catch {
        try {
          response = await fetch(`https://iiif.test.ubbe.no/iiif/manifest/stadnamn/NBAS/${manifestId}.json`);
          if (!response.ok) {
            setError("MANIFEST_NOT_FOUND")
            return
          }
        }
        catch {
          setError("MANIFEST_NOT_FOUND")
          return
        }
        
      }


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
          "protocol": "http://iiif.io/api/image"
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

        viewer.current.addHandler('tile-load-failed', function(event) {
          // Log the error to the console
          //console.log(event)
          setError("TILE_LOAD_FAILED")
          
          //setError({message: event.message, tile: event.tile, code: event.});
      
          // Optional: Handle the error, e.g., by displaying a custom error message to the user
          // or attempting to load a placeholder image.
      });

        viewer.current.addHandler('page', function(event: { page: React.SetStateAction<number>; }) {
          setCurrentPage(event.page);
        });


      } else {
        viewer.current.open(tileSources);
        viewer.current.viewport.goHome();
      }
    };

    fetchManifestAndInitializeViewer();
  }, [manifestId, dataset]);

  return (
    <div className='flex flex-col !h-full !w-full lg:grid lg:grid-cols-5'>
     
    <div className='w-full lg:col-span-4 relative !min-h-[40svh] bg-neutral-200'>
    { params.dataset &&
      <span className="absolute right-0 top-0 z-[1001] mx-3 my-2 rounded-full border-white text-white border bg-neutral-900 shadow-sm">
        <IconButton href={`/view/${dataset}${hasSearchParams ? '?' + searchParams.toString() : ''}`} className='p-2' label={searchParams.get('display') == 'table' ? 'Tilbake til tabellen' :'Tilbake til kartet'}>
          <PiXBold className='text-xl'/>
        </IconButton>
      </span>
    }
    {error ? <div className="pt-10"><ErrorMessage error={{error}} message="Kunne ikke laste bildet"/></div> : !viewerRef.current? 
    <div className='absolute top-0 left-0 w-full h-full text-white bg-opacity-50 flex items-center justify-center z-[1000]'><Spinner status="Laster inn bilde" className='w-20 h-20'/></div>
      : null
      }
    <div className='absolute top-0 flex z-[1000]  gap-2 text-xl p-2 text-white w-full'>

      <IconButton id="zoom-in-button-id" className="p-2 rounded-full border bg-neutral-900 border-white shadow-sm" label="Zoom inn"><PiMagnifyingGlassPlusFill/></IconButton>
        <IconButton id="zoom-out-button-id" className="p-2 rounded-full border bg-neutral-900 border-white shadow-sm" label="Zoom ut"><PiMagnifyingGlassMinusFill/></IconButton>
        <IconButton id="home-button-id" className="p-2 rounded-full border bg-neutral-900 border-white shadow-sm" label="Nullstill zoom"><PiHouseFill/></IconButton>
        <IconButton id="full-screen-button-id" className="p-2 rounded-full border bg-neutral-900 border-white shadow-sm" label="Fullskjerm"><PiCornersOut/></IconButton>

    </div>

    <div className='absolute bottom-0 left-0 flex z-[1000] gap-2 text-xl p-2 text-white w-full'>

    {numberOfPages > 1 && <div className="rounded-full border-white bottom-0 border bg-neutral-900 shadow-sm p-2 px-3 flex gap-2">
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
  </div>}
  
    </div>
    <div id="openseadragon-viewer" ref={viewerRef} style={{ width: '100%', height: '100%' }}></div>
    </div>
    {  manifest ?

      <div className='space-y-2 text-sm text-gray-800 p-8 page-info bg-white break-words border-l-2 border-neutral-200'>
          <h1>{manifest.label?.none?.[0] || manifest.label?.nb?.[0] || manifest.label?.nn?.[0]}</h1>

        <ul className="text-base !px-0">
        {manifest.metadata?.filter((item: Record<string, any>) => item.label?.no?.[0] != 'Skannede sedler') // Temporary filter removing unrendered anchor tag
        
        .map((item: Record<string, any>, index: number) => (
          <li key={index} className='flex flex-col'>
            <span className='font-semibold'>{item.label?.none?.[0] || item.label?.no?.[0] || item.label?.nb?.[0]}</span>
            <span>{item.value?.none?.[0]}</span>
          </li>
        ))}
        </ul>
      </div>
    : null
    }
    </div>
    
  );
};

export default DynamicImageViewer;

