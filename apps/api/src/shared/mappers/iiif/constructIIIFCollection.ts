// Converts a Linked Art "Set" object to a minimal IIIF Presentation 3 Collection object

import { env } from '@env';

type LanguageMap = { [lang: string]: string[] };

interface IIIFCollection {
  '@context': string[];
  id: string;
  type: 'Collection' | 'Manifest';
  label: LanguageMap;
  summary?: LanguageMap;
  items?: any[];
}

interface IIIFManifest {
  id: string;
  type: 'Manifest' | 'Collection';
  label: LanguageMap;
  thumbnail?: Array<{
    id: string;
    type: 'Image';
    format: string;
  }>;
}

function mapItemToIIIFManifest(item: any): IIIFManifest {
  // Get the label from _label
  const label = item._label || '';

  // Find thumbnail from representation
  let thumbnail: Array<{ id: string; type: 'Image'; format: string }> | undefined;

  if (Array.isArray(item.representation)) {
    // Look for the first representation that has a thumbnail
    for (const rep of item.representation) {
      if (Array.isArray(rep.digitally_shown_by)) {
        for (const digital of rep.digitally_shown_by) {
          // Check if this is classified as a thumbnail
          if (Array.isArray(digital.classified_as) &&
            digital.classified_as.some((c: any) => c._label === 'Thumbnails')) {

            if (Array.isArray(digital.access_point)) {
              const accessPoint = digital.access_point[0];
              if (accessPoint && accessPoint.id) {
                thumbnail = [{
                  id: accessPoint.id,
                  type: 'Image',
                  format: 'image/jpeg' // Default format, could be made dynamic
                }];
                break;
              }
            }
          }
        }
        if (thumbnail) break;
      }
    }
  }

  // Generate URL and type based on item type
  const baseUrl = item.type === 'HumanMadeObject'
    ? `${env.API_BASE_URL}/items/${item.id}?as=iiif`
    : `${env.API_BASE_URL}/sets/${item.id}?as=iiif`;

  const itemType = item.type === 'HumanMadeObject' ? 'Manifest' : 'Collection';

  const manifest: IIIFManifest = {
    id: baseUrl,
    type: itemType,
    label: { no: [label] }
  };

  if (thumbnail) {
    manifest.thumbnail = thumbnail;
  }

  return manifest;
}

export function constructIIIFCollection(set: any): IIIFCollection {
  // Get label (primary name, fallback to _label)
  let label: string | undefined;
  if (Array.isArray(set.identified_by)) {
    const primary = set.identified_by.find(
      (id: any) =>
        id.type === 'Name' &&
        Array.isArray(id.classified_as) &&
        id.classified_as.some(
          (c: any) =>
            c.id === 'http://vocab.getty.edu/aat/300404670' ||
            c._label === 'Primary Name'
        )
    );
    label = primary?.content;
  }
  if (!label && set._label) label = set._label;

  // Get summary (from referred_to_by, Description)
  let summary: string | undefined;
  if (Array.isArray(set.referred_to_by)) {
    const desc = set.referred_to_by.find(
      (r: any) =>
        Array.isArray(r.classified_as) &&
        r.classified_as.some(
          (c: any) =>
            c.id === 'http://vocab.getty.edu/aat/300435416' ||
            c._label === 'Description'
        )
    );
    summary = desc?.content;
  }

  // Map type: "Set" -> "Collection", "Humanmadeobject" -> "Manifest", other types remain as-is
  let iiifType: 'Collection' | 'Manifest';
  if (set.type === 'Set') {
    iiifType = 'Collection';
  } else if (set.type === 'HumanMadeObject') {
    iiifType = 'Manifest';
  } else {
    iiifType = 'Collection'; // Default for other types
  }

  // Generate URL based on type
  const baseUrl = set.type === 'HumanMadeObject'
    ? `${env.API_BASE_URL}/items/${set.id}`
    : `${env.API_BASE_URL}/sets/${set.id}`;

  // Compose IIIF Collection object
  const iiif: IIIFCollection = {
    '@context': ['http://iiif.io/api/presentation/3/context.json'],
    id: baseUrl,
    type: iiifType,
    label: { no: [label || ''] },
  };
  if (summary) {
    iiif.summary = { no: [summary] };
  }
  if (set.items) {
    iiif.items = set.items.map(mapItemToIIIFManifest);
  }
  return iiif;
}
