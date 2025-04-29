export function addPadding(bounds: [[number, number], [number, number]], isMobile: boolean): [[number, number], [number, number]] {
    if (isMobile) {
        const padding = bounds[1][0] - bounds[0][0]
        return [
            [bounds[0][0] - (padding / 3), bounds[0][1]],
            [bounds[1][0] + (padding * 3), bounds[1][1]]
        ]
    }
    else {
        const padding = (bounds[1][1] - bounds[0][1])
        return [
            [bounds[0][0], bounds[0][1] - padding],
            [bounds[1][0], bounds[1][1] + padding]
        ]
    }
}



export const yDistance = (currentMap: any, lat1: number, lat2: number) => {
    // Calculate vertical pixel distance between two latitude points using map projection
    if (!currentMap) return 0;
    
    const point1 = currentMap.latLngToContainerPoint([lat1, 0]);
    const point2 = currentMap.latLngToContainerPoint([lat2, 0]); 
    
    return Math.abs(point1.y - point2.y);
    }
  
export const xDistance = (currentMap: any, lon1: number, lon2: number) => {
      // Calculate horizontal pixel distance between two longitude points using map projection
      if (!currentMap) return 0;
      const point1 = currentMap.latLngToContainerPoint([0, lon1]);
      const point2 = currentMap.latLngToContainerPoint([0, lon2]); 
      return Math.abs(point1.x - point2.x);
  }


export const groupSameCoordinates = (data: any) => {
    const childrenWithCoordinates = data.filter((child: any) => child.fields.location?.[0]?.coordinates?.length)
    const clientGroups: any[] = []
    const markerLookup: Record<string, any> = {}

    childrenWithCoordinates.forEach((child: any) => {
        const lat = child.fields.location[0].coordinates[1]
        const lon = child.fields.location[0].coordinates[0]
        const uuid = child.fields.uuid[0]
        let marker = markerLookup[lat + "_" + lon]
        if (!marker) {
            marker = { children: [], lat, lon, uuid }
            markerLookup[lat + "_" + lon] = marker
            clientGroups.push(marker)
        }

        const label = child.fields.label[0]

        if (typeof marker.label == 'string' && marker.label !== label && !marker.label.endsWith('...')) {
            marker.label = marker.label + "..."
        } else {
            marker.label = label
        }

        marker.children.unshift(child)
    })

    return clientGroups
}

    
export const getValidDegree = (degrees: number, maxValue: number): string => {
    if (Math.abs(degrees) > Math.abs(maxValue)) {
        return maxValue.toString()
    }
    return degrees.toString()
    }