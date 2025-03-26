import React, { useEffect, useRef, useState, useCallback } from 'react';
import OpenSeadragon from 'openseadragon';
import { PiMagnifyingGlassPlusFill, PiMagnifyingGlassMinusFill, PiHouseFill, PiCornersOut, PiCaretRightFill, PiCaretLeftFill, PiXBold, PiArrowClockwise } from 'react-icons/pi';
import IconButton from '../ui/icon-button';
import Spinner from '@/components/svg/Spinner';
import { useParams, useSearchParams } from 'next/navigation';
import ErrorMessage from '../error-message';

const DynamicImageViewer = ({canvases, manifestDataset}: {canvases: Record<string, any>[], manifestDataset: string}) => {
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const viewer = useRef<OpenSeadragon.Viewer | null>(null);
  const [numberOfPages, setNumberOfPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [error, setError] = useState<any>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);


  useEffect(() => {

      //setIsLoading(true);
      // TODO: create api route that generates manifest from elasticsearch index  
      setCurrentPage(0)

      const tileSources = canvases.map((item: any) => {
        return {
          "@context": "http://iiif.io/api/image/2/context.json",
          "@id": `https://iiif.test.ubbe.no/iiif/image/stadnamn/${manifestDataset.toUpperCase()}/${item.image}`,
          "height": item.height,
          "width": item.width,
          "profile": [ "http://iiif.io/api/image/2/level2.json" ],
          "protocol": "http://iiif.io/api/image"
        };
      });

      console.log("TILES", tileSources)

      setNumberOfPages(tileSources.length);

      if (!viewer.current) {
        viewer.current = OpenSeadragon({
          id: "openseadragon-viewer",
          prefixUrl: "path/to/openseadragon/images/",
          maxZoomPixelRatio: 3.0,
          showNavigationControl: false,
          showSequenceControl: false,
          sequenceMode: true,
          tileSources: tileSources as any
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

  }, [canvases]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isInFullScreen = !!document.fullscreenElement;
      setIsFullScreen(isInFullScreen);
      
      // Sync OpenSeadragon's state with browser fullscreen state
      if (!isInFullScreen && viewer.current?.isFullPage()) {
        viewer.current.setFullPage(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && viewer.current?.isFullPage()) {
        viewer.current.setFullPage(false);
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(console.error);
        }
        setIsFullScreen(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleFullScreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullScreen(true);
    } else {
      document.exitFullscreen().catch((err) => {
        console.error(`Error attempting to exit fullscreen: ${err.message}`);
      });
      setIsFullScreen(false);
    }
  }, []);

  // Update the handleFullscreenClick function
  const handleFullscreenClick = () => {
    if (viewer.current) {
      handleFullScreen();
      viewer.current.setFullPage(!viewer.current.isFullPage());
    }
  };

  return (
    <div className='w-full h-full relative'>
      {error ? <div className="pt-10"><ErrorMessage error={{error}} message="Kunne ikke laste bildet"/></div> : !viewerRef.current? 
      <div className='absolute top-0 left-0 w-full h-full text-white bg-opacity-50 flex items-center justify-center z-[1000]'><Spinner status="Lastar inn bilde" className='w-20 h-20'/></div>
        : null
      }
      <div className='absolute top-0 flex z-[1000] gap-2 text-xl p-2 text-white w-full'>
        <IconButton 
          onClick={() => viewer.current?.viewport.zoomBy(1.5)} 
          className="p-2 rounded-full border bg-neutral-900 border-white shadow-sm" 
          label="Zoom inn">
            <PiMagnifyingGlassPlusFill aria-hidden="true" />
        </IconButton>
        <IconButton 
          onClick={() => viewer.current?.viewport.zoomBy(0.667)} 
          className="p-2 rounded-full border bg-neutral-900 border-white shadow-sm" 
          label="Zoom ut">
            <PiMagnifyingGlassMinusFill aria-hidden="true" />
        </IconButton>
        <IconButton 
          onClick={() => viewer.current?.viewport.goHome()} 
          className="p-2 rounded-full border bg-neutral-900 border-white shadow-sm" 
          label="Nullstill zoom">
            <PiArrowClockwise aria-hidden="true" />
        </IconButton>
        <IconButton 
          onClick={handleFullscreenClick} 
          className="p-2 rounded-full border bg-neutral-900 border-white shadow-sm" 
          label="Fullskjerm">
            <PiCornersOut aria-hidden="true" />
        </IconButton>
      </div>

      <div className='absolute bottom-0 left-0 flex z-[1000] gap-2 text-xl p-2 text-white w-full'>
        {numberOfPages > 1 && <div className="rounded-full border-white bottom-0 border bg-neutral-900 shadow-sm p-2 px-3 flex gap-2">
          <IconButton 
            onClick={() => viewer.current?.goToPage(currentPage - 1)}
            label="Forrige side">
              <PiCaretLeftFill aria-hidden="true" />
          </IconButton>
          <span className='text-base'>side {`${currentPage + 1}/${numberOfPages}`}</span>
          <IconButton 
            onClick={() => viewer.current?.goToPage(currentPage + 1)}
            label="Neste side">
              <PiCaretRightFill aria-hidden="true" />
          </IconButton>
        </div>}
      </div>
      
      <div id="openseadragon-viewer" ref={viewerRef} style={{ width: '100%', height: '100%' }}>
        {isFullScreen && (
          <div className='fixed top-4 right-4 z-[9999] text-xl text-white'>
            <IconButton 
              onClick={handleFullscreenClick}
              className="p-2 rounded-full border bg-neutral-900 border-white shadow-sm" 
              label="Lukk fullskjerm">
                <PiXBold aria-hidden="true" />
            </IconButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicImageViewer;

