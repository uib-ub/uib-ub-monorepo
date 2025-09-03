import { IIIFManifest } from '../blocks/iiif-manifest/components';

export default function IIFManifestDemo() {
  // Using a more reliable IIIF manifest for testing
  const manifestUrl = 'https://api.ub.uib.no/items/ubb-bs-ok-00919?as=iiif';

  return (
    <div className="w-full h-full">
      <IIIFManifest iiifContent={manifestUrl} />
    </div>
  );
}
