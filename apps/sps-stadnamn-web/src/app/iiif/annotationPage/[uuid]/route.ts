import { buildManifest } from "@/app/iiif/iiif-manifest-builder";

export async function GET(request: Request) {
    return buildManifest(request, 'annotationPage');
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Accept, Range, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  })
}