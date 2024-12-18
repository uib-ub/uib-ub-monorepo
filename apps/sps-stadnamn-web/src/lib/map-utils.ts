export function addPadding(bounds: [[number, number], [number, number]], isMobile: boolean): [[number, number], [number, number]] {
    console.log("ISMOBILE", isMobile)
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
