import { IIIFViewer } from '../components/iiif-viewer';

/**
 * IIIF Manifest demo.
 *
 * Clover IIIF's i18n is initialized globally in `src/lib/clover-i18n.tsx`
 * using `initCloverI18n`. By default this project uses Norwegian Bokmål (`nb`)
 * with fallbacks to `nb`, `no`, and `en`.
 *
 * To change the UI language or add translations, update the call to
 * `initCloverI18n` in `src/lib/clover-i18n.tsx`. See Clover's i18n docs:
 * https://samvera-labs.github.io/clover-iiif/docs/i18n
 */

export default function IIIFViewerDemo() {
  // Using a more reliable IIIF manifest for testing
  const manifestUrl = 'https://api.ub.uib.no/object/ubb-bs-ok-00919?as=iiif';

  return (
    <div className="w-full h-full">
      <IIIFViewer iiifContent={manifestUrl} />
    </div>
  );
}
