// Add property URIs

export const defaultDoc2jsonld = (source: any, children: any) => {
    return {
        "@context": "https://linked.art/ns/v1/linked-art.json",
        "id": `https://purl.org/stadnamn/uuid/${source.uuid}`,
        "type": "document",
        "_label": source.label
    };
}

export const doc2jsonld = {
    search: (source: any, children: any) => {
        console.log("CHILDREN", children)

        // Group children by coordinates and place - each combination of coordinates and place type is a separate place.
        // The resulting places only need to contain coordinates and place type, and the children that are identified by them (documented_in)
        
        const places = children.reduce((acc: any, child: any) => {
            // Use coordinates if available, otherwise use wikidata ID, finally fallback to uuid
            const { location, sosi, wikiAdm, uuid } = child?._source || {}
            const key = location?.coordinates ? 
                location.coordinates.join(' ') + (sosi ? `-${sosi}` : '') :
                wikiAdm ? `wiki-${wikiAdm}` : `uuid-${uuid}`

            if (!acc[key]) {
                acc[key] = {
                    ...(location?.coordinates && { 
                        coordinates: location.coordinates 
                    }),
                    ...(sosi && { sosi: sosi }),
                    ...(wikiAdm && { 
                        part_of: {
                            "id": `https://www.wikidata.org/entity/${wikiAdm}`,
                            "type": "Place"
                        }
                    }),
                    documented_in: []
                }
            }
            acc[key].documented_in.push({
                "id": `https://purl.org/stadnamn/uuid/${uuid}`,
                "type": "Document"
            })
            return acc
        }, {})

        console.log("PLACES", places)



        const jsonld = {
            "@context": "https://linked.art/ns/v1/linked-art.json",
            "id": `https://purl.org/stadnamn/uuid/${source.uuid}`,
            "type": "Name",
            "_label": source.label,
            "documented_in": source.children.map((childUuid: any) => ({
                "id": `https://purl.org/stadnamn/uuid/${childUuid}`,
                "type": "Document"
            })),
            "identifies": Object.values(places).map((place: any, index: number) => ({
                "id": "_:place" + index,
                "type": "Place",
                ...place.coordinates && {
                    "defined_by":  `POINT(${place.coordinates.join(' ')})`,
                "documented_in": place.documented_in
                }
            }))
            
            

        }
        return jsonld
    },
    
    nbas_reykjavik: (source: any, children: any) => {
        const baseObject: any = {
            "@context": [
                "https://linked.art/ns/v1/linked-art.json",
                {
                    "owl": "http://www.w3.org/2002/07/owl#",
                    "geo": "http://www.opengis.net/ont/geosparql#",
                    "sosi": "http://skjema.geonorge.no/SOSI/produktspesifikasjon/Stedsnavn/5.0/Navneobjekttype/",
                }
            ],
            "id": "https://purl.org/stadnamn/uuid/" + source.uuid,
            "type": "Name",
            "_label": source.label,
            "identifies": {
                "id": "https://purl.org/stadnamn/uuid/" + source.misc.place_uuid,
                "type": "Place",
                "owl:sameAs": "http://localhost:3000/uuid/" + source.misc.place_uuid
            }
        }

        // Add place details
        const place = baseObject["identifies"]
        
        // Add municipality reference
        if (source.misc.municipality_uuid) {
            place["approximated_by"] = {
                "id": "http://localhost:3000/uuid/" + source.misc.municipality_uuid
            }
        }

        // Add coordinates if available
        if (source.rawData.X && source.rawData.Y) {
            place["approximated_by"] = {
                "id": "https://purl.org/stadnamn/uuid/" + source.misc.coordinate_uuid,
                "type": "Place",
                "owl:sameAs": "http://localhost:3000/uuid/" + source.misc.coordinate_uuid,
                "classified_as": {
                    "id": "crm:E47_Spatial_Coordinates"
                },
                "geo:asWKT": {
                    "@value": `POINT(${source.rawData.X} ${source.rawData.Y})`,
                    "@type": "geo:wktLiteral"
                }
            }
            place["geo:hasGeometry"] = {
                "id": "https://purl.org/stadnamn/uuid/" + source.misc.coordinate_uuid,
            }
        }

        // Add place type if specified
        if (source.sosi && source.sosi !== "uspesifisert lokalitet") {
            place["classified_as"] = {
                "id": "sosi:" + source.sosi
            }
        }

        return baseObject
    }
}


