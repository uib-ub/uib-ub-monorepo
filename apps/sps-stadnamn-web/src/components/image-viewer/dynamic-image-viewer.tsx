import React, { useEffect, useRef, useState, useCallback } from 'react';
import OpenSeadragon from 'openseadragon';
import { PiMagnifyingGlassPlusFill, PiMagnifyingGlassMinusFill, PiCornersOut, PiCaretRightFill, PiCaretLeftFill, PiXBold, PiArrowClockwise, PiDownloadSimple } from 'react-icons/pi';
import IconButton from '../ui/icon-button';
import Spinner from '@/components/svg/Spinner';
import ErrorMessage from '../error-message';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const DynamicImageViewer = ({images, manifestDataset, manifestId}: {images: Record<string, any>[], manifestDataset: string, manifestId: string}) => {
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

      const tileSources = images.map((image: any) => {
        return {
          "@context": "http://iiif.io/api/image/2/context.json",
          "@id": `https://iiif.test.ubbe.no/iiif/image/stadnamn/${manifestDataset.toUpperCase()}/${image.uuid}`,
          "height": image.height,
          "width": image.width,
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

  }, [images, manifestDataset, manifestId]);

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

  const handleDownload = useCallback(async (format: string, allPages?: boolean) => {
    if (viewer.current && images[currentPage]) {
      try {
        const params = new URLSearchParams({
          uuid: manifestId,
          format,
          ...((!allPages && currentPage !== undefined) && { page: currentPage.toString() })
        });
        
        const response = await fetch(`/api/iiif/download?${params.toString()}`);
        if (!response.ok) throw new Error('Download failed');

        const contentDisposition = response.headers.get('Content-Disposition');
        const matches = contentDisposition?.match(/filename\*=UTF-8''([^;]+)/);
        const filename = matches ? decodeURIComponent(matches[1]) : 'download';

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error downloading:', error);
      }
    }
  }, [currentPage, images, manifestId]);

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
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <IconButton 
              className="p-2 rounded-full border bg-neutral-900 border-white shadow-sm" 
              label="Last ned">
                <PiDownloadSimple aria-hidden="true" />
            </IconButton>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogCancel className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <PiXBold className="text-xl" aria-hidden="true"/>
              <span className="sr-only">Close</span>
            </AlertDialogCancel>
            <AlertDialogHeader>
              <AlertDialogTitle>Last ned bilde</AlertDialogTitle>
              <AlertDialogDescription>
                Vel ønska format for nedlasting av bildet.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <div className="flex flex-row gap-2 justify-center w-full">
                <AlertDialogCancel className="btn btn-outline">
                  Avbryt
                </AlertDialogCancel>
                <AlertDialogAction 
                  className="btn btn-outline"
                  onClick={() => handleDownload('jpg', false)}
                >
                  JPG
                </AlertDialogAction>
                <AlertDialogAction 
                  className="btn btn-outline"
                  onClick={() => handleDownload('pdf', false)}
                >
                  PDF{numberOfPages > 1 ? ' - denne sida' : ''}
                </AlertDialogAction>
                {numberOfPages > 1 && (
                  <AlertDialogAction 
                    className="btn btn-outline"
                    onClick={() => handleDownload('pdf', true)}
                  >
                    PDF - alle sider
                  </AlertDialogAction>
                )}
              </div>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <IconButton 
          onClick={handleFullscreenClick} 
          className="p-2 rounded-full border bg-neutral-900 border-white shadow-sm" 
          label="Fullskjerm">
            <PiCornersOut aria-hidden="true" />
        </IconButton>
      </div>

      <div className='absolute top-0 right-0 flex z-[1000] gap-2 text-xl p-2 text-white'>
        {numberOfPages > 1 && <div className="rounded-full border-white bottom-0 border bg-neutral-900 shadow-sm p-2 px-3 flex gap-2">
          <IconButton 
            onClick={() => viewer.current?.goToPage(currentPage - 1)}
            label="Forrige side">
              <PiCaretLeftFill aria-hidden="true" />
          </IconButton>
          <span className='text-base'>{`${currentPage + 1}/${numberOfPages}`}</span>
          <IconButton 
            onClick={() => viewer.current?.goToPage(currentPage + 1)}
            label="Neste side">
              <PiCaretRightFill aria-hidden="true" />
          </IconButton>
        </div>}
      </div>
      
      <div id="openseadragon-viewer" ref={viewerRef} style={{ width: '100%', height: '100%' }}>
        {isFullScreen && (
          <div className='fixed top-4 right-4 z-[9999] text-xl text-white flex gap-2'>
            {numberOfPages > 1 && <div className="rounded-full border-white items-center border bg-neutral-900 shadow-sm p-2 px-3 flex gap-2">
          <IconButton 
            onClick={() => viewer.current?.goToPage(currentPage - 1)}
            label="Forrige side">
              <PiCaretLeftFill aria-hidden="true" />
          </IconButton>
          <span className='text-base'>{`${currentPage + 1}/${numberOfPages}`}</span>
          <IconButton 
            onClick={() => viewer.current?.goToPage(currentPage + 1)}
            label="Neste side">
              <PiCaretRightFill aria-hidden="true" />
          </IconButton>
        </div>}
            <IconButton 
              onClick={handleFullscreenClick}
              className="p-2 px-3 rounded-full border aspect-square bg-neutral-900 border-white shadow-sm items-center" 
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

