import { fetchDoc } from "@/app/api/_utils/actions";
import { postQuery } from "@/app/api/_utils/post";
import { datasetPresentation, licenses } from "@/config/metadata-config";
import { ensureArrayValues } from "@/app/iiif/iiif-utils";

function getBaseUrlFromRequest(request: Request): string {
  try {
    const { origin } = new URL(request.url)
    if (origin) return origin
  } catch { }
  const proto = request.headers.get('x-forwarded-proto') || 'https'
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host')
  if (host) return `${proto}://${host}`
  return 'http://stadnamn.no'
}

function buildImageCanvas(image: any, manifestDataset: string, baseUrl: string) {
  return {
    "id": `${baseUrl}/iiif/canvas/${image.canvasUuid}`,
    "type": "Canvas",
    "height": image.height,
    "width": image.width,
    "items": [buildAnnotationPage(image, manifestDataset, baseUrl)]
  }
}

function buildAnnotationPage(image: any, manifestDataset: string, baseUrl: string) {
  return {
    "id": `${baseUrl}/iiif/annotationPage/${image.annotationPageUuid}`,
    "type": "AnnotationPage",
    "items": [buildAnnotation(image, manifestDataset, baseUrl)]
  }
}

function buildAnnotation(image: any, manifestDataset: string, baseUrl: string) {
  return {
    "id": `${baseUrl}/iiif/annotation/${image.annotationUuid}`,
    "type": "Annotation",
    "motivation": "painting",
    "target": `${baseUrl}/iiif/canvas/${image.canvasUuid}`,
    "body": {
      "id": `https://iiif.spraksamlingane.no/iiif/image/stadnamn/${manifestDataset.toUpperCase()}/${image.uuid}/full/max/0/default.jpg`,
      "type": "Image",
      "height": image.height,
      "width": image.width,
      "format": "image/jpg",
      "service": [
        {
          "id": `https://iiif.spraksamlingane.no/iiif/image/stadnamn/${manifestDataset.toUpperCase()}/${image.uuid}`,
          "type": "ImageService3",
          "profile": "level1",
        }
      ]
    }
  }
}

function buildAudioCanvas(audio: any, manifestDataset: string, baseUrl: string) {
  return {
    "id": `${baseUrl}/iiif/canvas/${audio.canvasUuid}`,
    "type": "Canvas",
    "duration": audio.duration,
    "items": [buildAudioAnnotationPage(audio, manifestDataset, baseUrl)]
  }
}

function buildAudioAnnotationPage(audio: any, manifestDataset: string, baseUrl: string) {
  return {
    "id": `${baseUrl}/iiif/annotationPage/${audio.annotationPageUuid}`,
    "type": "AnnotationPage",
    "items": [buildAudioAnnotation(audio, manifestDataset, baseUrl)]
  }
}

function buildAudioAnnotation(audio: any, manifestDataset: string, baseUrl: string) {
  return {
    "id": `${baseUrl}/iiif/annotation/${audio.annotationUuid}`,
    "type": "Annotation",
    "motivation": "painting",
    "target": `${baseUrl}/iiif/canvas/${audio.canvasUuid}`,
    "body": {
      "id": `https://iiif.spraksamlingane.no/iiif/audio/stadnamn/${manifestDataset.toUpperCase()}/${audio.uuid}`,
      "type": "Sound",
      "format": "audio/" + audio.format,
      "duration": audio.duration,
      "target": `${baseUrl}/iiif/canvas/${audio.canvasUuid}`,
    }
  }
}

export async function buildManifest(request: Request, type: string) {
  const url = new URL(request.url);
  const uuid: string = url.pathname.replace('.json', '').split('/').pop() as string
  // validate that uuid is a string with correct length 
  if (!uuid || uuid.length !== 36) {
    return Response.json({ error: 'Invalid UUID' }, { status: 400 })
  }

  let doc
  if (type == 'collection' || type == 'manifest') {
    doc = await fetchDoc({ uuid })
  }

  if (type == 'canvas' || type == 'annotationPage' || type == 'annotation') {
    const query = {
      "query": {
        [type + "Uuid"]: uuid

      }
    }
    doc = await postQuery('iiif_*', query)
  }

  if (!doc) {
    return Response.json({ error: 'Document not found' }, { status: 404 })
  }
  else {
    doc = ensureArrayValues(doc)
  }


  const source = doc._source
  const manifestDataset = doc._index.split('-')[2].replace('iiif_', '')
  const license = datasetPresentation[manifestDataset]?.license || licenses.ccby4
  const baseUrl = getBaseUrlFromRequest(request)

  if (type == 'collection') {
    const items_query = {
      "query": {
        "term": {
          "partOf": uuid
        }
      },
      "sort": ["order"],
      "_source": ["uuid", "type", "label"]
    }
    const [items, status] = await postQuery('iiif_*', items_query)



    const collection_manifest: Record<string, any> = {
      "@context": "http://iiif.io/api/presentation/3/context.json",
      "id": `${baseUrl}/iiif/collection/${doc._source.uuid}`,
      "rights": license.url,
      "type": source.type,
      "label": source.label,
      "items": []
    }

    if (source.summary) {
      collection_manifest["summary"] = source.summary
    }


    collection_manifest["items"] = items.hits.hits.map((item: any) => {
      return {
        "id": `${baseUrl}/iiif/${item._source.type.toLowerCase()}/${item._source.uuid}`,
        "type": item._source.type,
        "label": item._source.label,
      }
    })


    return Response.json(collection_manifest, { status })
  }


  if (type == 'manifest') {
    const manifest: Record<string, any> = {
      "@context": "http://iiif.io/api/presentation/3/context.json",
      "id": `${baseUrl}/iiif/manifest/${doc._source.uuid}`,
      "partOf": [{ "id": `${baseUrl}/iiif/collection/${doc._source.partOf}`, "type": "Collection" }],
      "rights": license.url,
      "type": "Manifest",
      "label": source.label,
    }

    if (source.summary) {
      manifest["summary"] = source.summary
    }
    if (source.metadata) {
      manifest["metadata"] = source.metadata
    }

    if (source.alternativeManifests) {
      manifest["seeAlso"] = source.alternativeManifests.map((manifest: any) => ({
        "id": `${baseUrl}/iiif/manifest/${manifest.uuid}`,
        "type": "Dataset",
        "label": manifest.label
      }))
    }


    if (source.images) {
      if (source.images.length > 1) {
        manifest["behavior"] = ["paged"]
      }
      manifest["items"] = source.images.map((image: any) => buildImageCanvas(image, manifestDataset, baseUrl))
    }

    if (source.audio) {
      manifest["items"] = [buildAudioCanvas(source.audio, manifestDataset, baseUrl)]
    }

    return Response.json(manifest, { status: 200 })
  }




  if (type == 'canvas') {
    if (source.images) {
      const canvas = source.images.find((image: any) => image.canvasUuid == uuid)
      return Response.json(buildImageCanvas(canvas, manifestDataset, baseUrl))
    } else if (source.audio) {
      return Response.json(buildAudioCanvas(source.audio, manifestDataset, baseUrl))
    }
  }

  if (type == 'annotationPage') {
    if (source.images) {
      const canvas = source.images.find((image: any) => image.annotationPageUuid == uuid)
      return Response.json(buildAnnotationPage(canvas, manifestDataset, baseUrl))
    } else if (source.audio) {
      return Response.json(buildAudioAnnotationPage(source.audio, manifestDataset, baseUrl))
    }
  }

  if (type == 'annotation') {
    if (source.images) {
      const canvas = source.images.find((image: any) => image.annotationUuid == uuid)
      return Response.json(buildAnnotation(canvas, manifestDataset, baseUrl))
    } else if (source.audio) {
      return Response.json(buildAudioAnnotation(source.audio, manifestDataset, baseUrl))
    }

  }

  return Response.json({ error: `Invalid type: ${type}` }, { status: 400 })



}