import { buildManifest } from "@/app/iiif/iiif-manifest-builder";

export async function GET(request: Request) {
    return buildManifest(request, 'annotation');
}