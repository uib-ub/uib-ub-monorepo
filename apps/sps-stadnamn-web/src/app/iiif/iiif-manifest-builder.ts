import { fetchDoc } from "@/app/api/_utils/actions";
import { postQuery } from "@/app/api/_utils/post";
import { datasetPresentation } from "@/config/metadata-config";
import { ensureArrayValues } from "@/app/iiif/iiif-utils";





function buildImageCanvas(image: any, manifestDataset: string) {
  return {
    "id": `https://stadnamnportalen.uib.no/iiif/canvas/${image.canvasUuid}`,
    "type": "Canvas",
    "height": image.height,
    "width": image.width,
    "items": [buildAnnotationPage(image, manifestDataset)]
  }
}

function buildAnnotationPage(image: any, manifestDataset: string) {
  return {
    "id": `https://stadnamnportalen.uib.no/iiif/annotationPage/${image.annotationPageUuid}`,
    "type": "AnnotationPage",
    "items": [buildAnnotation(image, manifestDataset)]
  }
}

function buildAnnotation(image: any, manifestDataset: string) {
  return {
    "id": `https://stadnamnportalen.uib.no/iiif/annotation/${image.annotationUuid}`,
    "type": "Annotation",
    "motivation": "painting",
    "target": `https://stadnamnportalen.uib.no/iiif/canvas/${image.canvasUuid}`,
    "body": {
      "id": `https://iiif.test.ube.no/iiif/image/stadnamn/${manifestDataset.toUpperCase()}/${image.uuid}/full/max/0/default.${image.format}`,
      "type": "Image",
      "height": image.height,
      "width": image.width,
      "format": "image/" + image.format,
      "service": [
        {
          "id": `https://iiif.test.ube.no/iiif/image/stadnamn/${manifestDataset.toUpperCase()}/${image.uuid}`,
          "type": "ImageService3",
          "profile": "level1",
        }
      ]
    }
  }
}

function buildAudioCanvas(audio: any, manifestDataset: string) {
  return {
    "id": `https://stadnamnportalen.uib.no/iiif/canvas/${audio.canvasUuid}`,
    "type": "Canvas",
    "duration": audio.duration,
    "items": [buildAudioAnnotationPage(audio, manifestDataset)]
  }
}

function buildAudioAnnotationPage(audio: any, manifestDataset: string) {
  return {
    "id": `https://stadnamnportalen.uib.no/iiif/annotationPage/${audio.annotationPageUuid}`,
    "type": "AnnotationPage",
    "items": [buildAudioAnnotation(audio, manifestDataset)]
  }
}

function buildAudioAnnotation(audio: any, manifestDataset: string) {
  return {
    "id": `https://stadnamnportalen.uib.no/iiif/annotation/${audio.annotationUuid}`,
    "type": "Annotation",
    "motivation": "painting",
    "target": `https://stadnamnportalen.uib.no/iiif/canvas/${audio.canvasUuid}`,
    "body": {
      "id": `https://iiif.test.ube.no/iiif/audio/stadnamn/${manifestDataset.toUpperCase()}/${audio.uuid}`,
      "type": "Sound",
      "format": "audio/" + audio.format,
      "duration": audio.duration,
      "target": `https://stadnamnportalen.uib.no/iiif/canvas/${audio.canvasUuid}`,
    }
  }
}

export async function buildManifest(request: Request, type: string) {
    const url = new URL(request.url);
    const uuid: string = url.pathname.split('/').pop() as string
    // validate that uuid is a string with correct length 
    if (!uuid || uuid.length !== 36) {
        return Response.json({error: 'Invalid UUID'}, {status: 400})
    }

    let doc
    if (type == 'collection' || type == 'manifest') {
        doc = await fetchDoc({uuid})
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
        return Response.json({error: 'Document not found'}, {status: 404})
    }
    else {
        doc = ensureArrayValues(doc)
    }
    
    
    const source = doc._source
    const manifestDataset = doc._index.split('-')[2].replace('iiif_', '')

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
        "id": `https://stadnamnportalen.uib.no/iiif/collection/${doc._source.uuid}`,
        "rights": datasetPresentation[manifestDataset].license.url,
        "type": source.type,
        "label": source.label,
        "items": []
        }

        if (source.summary) {
        collection_manifest["summary"] = source.summary
        }


        collection_manifest["items"] = items.hits.hits.map((item: any) => {
        return {
            "id": `https://stadnamnportalen.uib.no/iiif/${item._source.type.toLowerCase()}/${item._source.uuid}`,
            "type": item._source.type,
            "label": item._source.label,
        }
        })

        
        return Response.json(collection_manifest, {status})
    }


    if (type == 'manifest') {
        const manifest: Record<string, any> = {
            "@context": "http://iiif.io/api/presentation/3/context.json",
            "id": `https://stadnamnportalen.uib.no/iiif/manifest/${doc._source.uuid}`,
            "rights": datasetPresentation[manifestDataset].license.url,
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
                "id": `https://stadnamnportalen.uib.no/iiif/manifest/${manifest.uuid}`,
                "type": "Dataset",
                "label": manifest.label
            }))
        }
    

        if (source.images) {
            if (source.images.length > 1) {
                manifest["behavior"] = ["paged"]
            }
            manifest["items"] = source.images.map((image: any) => buildImageCanvas(image, manifestDataset))
        }

        if (source.audio) {
            manifest["items"] = [buildAudioCanvas(source.audio, manifestDataset)]
        }

        return Response.json(source, {status: 200})
    }




    if (type == 'canvas') {
        if (source.images) {
            const canvas = source.images.find((image: any) => image.canvasUuid == uuid)
            return Response.json(buildImageCanvas(canvas, manifestDataset))
        } else if (source.audio) {
            return Response.json(buildAudioCanvas(source.audio, manifestDataset))
        }
    }

    if (type == 'annotationPage') {
        if (source.images) {
            const canvas = source.images.find((image: any) => image.annotationPageUuid == uuid)
            return Response.json(buildAnnotationPage(canvas, manifestDataset))
        } else if (source.audio) {
            return Response.json(buildAudioAnnotationPage(source.audio, manifestDataset))
        }
    }

    if (type == 'annotation') {
        if (source.images) {
            const canvas = source.images.find((image: any) => image.annotationUuid == uuid)
            return Response.json(buildAnnotation(canvas, manifestDataset))
        } else if (source.audio) {
            return Response.json(buildAudioAnnotation(source.audio, manifestDataset))
        }

    }

    return Response.json({error: `Invalid type: ${type}`}, {status: 400})

  
    
  }