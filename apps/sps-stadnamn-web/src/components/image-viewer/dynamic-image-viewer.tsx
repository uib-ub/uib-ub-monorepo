import Spinner from '@/components/svg/Spinner';
import { GlobalContext } from '@/state/providers/global-provider';
import { useIIIFSessionStore } from '@/state/zustand/iiif-session-store';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { PiArrowClockwiseBold, PiCaretLeftFill, PiCaretRightFill, PiCornersOutBold, PiMagnifyingGlassMinusBold, PiMagnifyingGlassPlusBold, PiXBold } from 'react-icons/pi';
import ErrorMessage from '../error-message';
import { RoundIconButton } from '../ui/clickable/round-icon-button';
import IconButton from '../ui/icon-button';

const IIIF_ORIGIN = 'https://iiif.spraksamlingane.no';
const IIIF_IMAGE_PATH_PREFIX = '/iiif/image/stadnamn/';

function assertAllowedIiifUrl(url: URL) {
  if (url.origin !== IIIF_ORIGIN) throw new Error(`Disallowed IIIF origin: ${url.origin}`);
  if (!url.pathname.startsWith(IIIF_IMAGE_PATH_PREFIX)) {
    throw new Error(`Disallowed IIIF path: ${url.pathname}`);
  }
}

const DynamicImageViewer = ({ images, manifestDataset, manifestId }: { images: Record<string, any>[], manifestDataset: string, manifestId: string }) => {
  const viewerRef = useRef<HTMLDivElement | null>(null);
  // Lazily created to keep initial JS parse/execute low (OpenSeadragon is imported dynamically).
  const viewer = useRef<any | null>(null);
  const [numberOfPages, setNumberOfPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [error, setError] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pendingLoadRef = useRef(false);
  const expectedPageRef = useRef<number | null>(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const currentPosition = useIIIFSessionStore((s) => s.currentPosition)
  const snappedPosition = useIIIFSessionStore((s) => s.snappedPosition)
  const drawerOpen = useIIIFSessionStore((s) => s.drawerOpen)
  const { isMobile } = useContext(GlobalContext)

  const beginLoading = useCallback((expectedPage?: number) => {
    pendingLoadRef.current = true;
    if (typeof expectedPage === 'number') {
      expectedPageRef.current = expectedPage;
    }
    setIsLoading(true);
    setError(null);
  }, []);

  const finishLoading = useCallback(() => {
    if (!pendingLoadRef.current) return;
    pendingLoadRef.current = false;
    setIsLoading(false);
  }, []);

  // Clean up OpenSeadragon on unmount to avoid leaking WebGL contexts.
  useEffect(() => {
    return () => {
      try {
        viewer.current?.destroy();
      } catch {
        // ignore cleanup errors
      } finally {
        viewer.current = null;
      }
    };
  }, []);

  useEffect(() => {

    // TODO: create api route that generates manifest from elasticsearch index  
    beginLoading(0);
    setCurrentPage(0)

    let cancelled = false;

    const schedule = (fn: () => void) => {
      const w = window as any;
      if (typeof w.requestIdleCallback === 'function') {
        const id = w.requestIdleCallback(fn, { timeout: 1500 });
        return () => {
          try { w.cancelIdleCallback?.(id); } catch { /* ignore */ }
        };
      }
      const t = window.setTimeout(fn, 1);
      return () => window.clearTimeout(t);
    };

    const cancelScheduled = schedule(() => {
      void (async () => {
        try {
          const dataset = manifestDataset.toUpperCase();
          const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          if (!/^[A-Z0-9_-]+$/.test(dataset)) throw new Error(`Invalid dataset: ${manifestDataset}`);

          const tileSources = images.map((image: any) => {
            const uuid = String(image.uuid || '');
            if (!uuidRe.test(uuid)) throw new Error(`Invalid image uuid: ${uuid}`);

            const iiifId = new URL(`/iiif/image/stadnamn/${dataset}/${uuid}`, 'https://iiif.spraksamlingane.no');
            assertAllowedIiifUrl(iiifId);

            return {
              "@context": "http://iiif.io/api/image/2/context.json",
              "@id": iiifId.toString(),
              "height": image.height,
              "width": image.width,
              "profile": ["http://iiif.io/api/image/2/level2.json"],
              "protocol": "http://iiif.io/api/image"
            };
          });

          if (cancelled) return;
          setNumberOfPages(tileSources.length);

          // Lazy import to avoid adding OpenSeadragon to the initial JS execution path.
          const mod = await import('openseadragon');
          const OpenSeadragon = (mod as any).default ?? mod;
          if (cancelled) return;

          if (!viewer.current) {
            viewer.current = OpenSeadragon({
              id: "openseadragon-viewer",
              prefixUrl: "path/to/openseadragon/images/",
              maxZoomPixelRatio: 3.0,
              showNavigationControl: false,
              showSequenceControl: false,
              sequenceMode: true,
              // Helps WebGL/canvas use the tiles safely *if* the IIIF server sends CORS headers.
              crossOriginPolicy: 'Anonymous',
              tileSources: tileSources as any
            });

            viewer.current.addHandler('tile-load-failed', function () {
              setError("TILE_LOAD_FAILED")
              pendingLoadRef.current = false;
              setIsLoading(false);
            });

            viewer.current.addHandler('page', function (event: { page: number; }) {
              beginLoading(event.page);
              setCurrentPage(event.page);
            });

            // WebGLDrawer doesn't raise `tile-drawn`; use first `tile-loaded` for the requested page instead.
            viewer.current.addHandler('tile-loaded', function () {
              const expectedPage = expectedPageRef.current;
              const current = (viewer.current as any)?.currentPage?.();

              if (typeof expectedPage === 'number' && typeof current === 'number' && expectedPage !== current) {
                return;
              }

              finishLoading();
            });

          } else {
            beginLoading(0);
            viewer.current.open(tileSources);
            viewer.current.viewport.goHome();
          }
        } catch (e: any) {
          if (cancelled) return;
          setError(e?.message || 'INVALID_IIIF_SOURCE');
          pendingLoadRef.current = false;
          setIsLoading(false);
        }
      })();
    });

    return () => {
      cancelled = true;
      cancelScheduled();
    };

  }, [beginLoading, finishLoading, images, manifestDataset, manifestId]);

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

  const handleGoToPage = (page: number) => {
    if (!viewer.current) return;
    beginLoading(page);
    viewer.current.goToPage(page);
  };


  return (
    <div className='w-full h-full relative'>
      {error ? (
        <div className="pt-10"><ErrorMessage error={{ error }} message="Kunne ikke laste bildet" /></div>
      ) : isLoading ? (
        <div className='absolute top-0 left-0 w-full h-full text-white bg-neutral-950/40 flex items-center justify-center z-[1000]'>
          <Spinner status="Lastar inn bilde" className='w-20 h-20' />
        </div>
      ) : null}
      {(!isMobile || snappedPosition != 'middle') && <div className={`absolute right-0 flex z-[1000] gap-2 p-2 text-white`}>
        {!isMobile && <><RoundIconButton
          onClick={() => viewer.current?.viewport.zoomBy(1.5)}
          label="Zoom inn">
          <PiMagnifyingGlassPlusBold className='text-xl xl:text-base' />
        </RoundIconButton>
          <RoundIconButton
            onClick={() => viewer.current?.viewport.zoomBy(0.667)}
            label="Zoom ut">
            <PiMagnifyingGlassMinusBold className='text-xl xl:text-base' />
          </RoundIconButton></>}
        <RoundIconButton
          onClick={() => viewer.current?.viewport.goHome()}
          label="Nullstill zoom">
          <PiArrowClockwiseBold className='text-xl xl:text-base' />
        </RoundIconButton>
        <RoundIconButton
          onClick={handleFullscreenClick}
          label="Fullskjerm">
          <PiCornersOutBold className='text-xl xl:text-base' />
        </RoundIconButton>
      </div>}

      {numberOfPages > 1 && <div
        className="absolute right-4 xl:right-1/2 xl:translate-x-1/2 flex z-[1000] font-semibold bg-neutral-950/70 items-center text-white rounded-full backdrop-blur-sm"
        style={{ bottom: (isMobile ? `${drawerOpen ? currentPosition : 4.5}rem` : '1rem') }}
      >

        <IconButton
          className="p-3"
          onClick={() => handleGoToPage(currentPage - 1)}
          label="Forrige side">
          <PiCaretLeftFill aria-hidden="true" />
        </IconButton>
        <span className='text-base'>{`${currentPage + 1}/${numberOfPages}`}</span>
        <IconButton
          className="p-3"
          onClick={() => handleGoToPage(currentPage + 1)}
          label="Neste side">
          <PiCaretRightFill aria-hidden="true" />
        </IconButton>

      </div>}

      <div id="openseadragon-viewer" ref={viewerRef} style={{ width: '100%', height: '100%' }}>
        {isFullScreen && isMobile && (
          <div className='fixed top-4 right-4 z-[9999] text-xl text-white flex gap-2'>
            <RoundIconButton
              onClick={handleFullscreenClick}

              label="Lukk fullskjerm">
              <PiXBold aria-hidden="true" />
            </RoundIconButton>
          </div>
        )}
      </div>

    </div>
  );
};

export default DynamicImageViewer;

