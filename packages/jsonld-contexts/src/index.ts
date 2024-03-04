import esMappingContext from './esMappingContext';
import { iiifManifestContext } from './iiifManifest';
import { iiifPresentation3Context } from './external/iiifPresentationContext';
import { linkedArtContext } from './external/linkedArt';
import { skaLegacyContext } from './legacy/skaContext';
import { wabLegacyContext } from './legacy/wabContext';
import shaclContext from './shaclContext';
import ubbontContext from './ubbontContext';

export const CONTEXTS = {
  [`https://api.ub.uib.no/ns/ubbont/context.json`]: ubbontContext,
  [`https://api.ub.uib.no/ns/es/context.json`]: esMappingContext,
  [`https://api.ub.uib.no/ns/shacl/context.json`]: shaclContext,
  [`https://api.ub.uib.no/ns/manifest/context.json`]: iiifManifestContext,
  [`https://api.ub.uib.no/ns/legacy/ska/context.json`]: skaLegacyContext,
  [`https://api.ub.uib.no/ns/legacy/wab/context.json`]: wabLegacyContext,
  [`https://linked.art/ns/v1/linked-art.json`]: linkedArtContext,
  [`http://iiif.io/api/presentation/3/context.json`]: iiifPresentation3Context,
}

export default {
  ubbontContext,
  esMappingContext,
  shaclContext,
  iiifManifestContext,
  skaLegacyContext,
  wabLegacyContext,
  linkedArtContext,
  iiifPresentation3Context,
}