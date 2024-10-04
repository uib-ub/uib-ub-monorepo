
const colorMapping: Record<string,string> = {
    'black': '#282524',
    'primary': '#e15452',
    'accent': '#009ffe',
}

const buildMarker = (color: string, style: string) => {
    // assign hex from color name
    const fill = colorMapping[color] || color

    return `<svg
    viewBox="0 0 13.229166 21.695834"
    version="1.1"
    style="${style}"
    id="svg5"
    xmlns="http://www.w3.org/2000/svg">
   <defs id="defs2" />
   <g id="layer1">
     <g id="g35914" transform="matrix(0.298402,0,0,0.298402,-0.96482737,5.8697336)">
       <g id="g35909">
         <path
            id="path28141"
            fill="${fill}"
            style="stroke-width:7.55906"
            stroke="white"
            d="M 96,0 A 79.999998,79.999998 0 0 0 16,80 79.999998,79.999998 0 0 0 79.082031,158.16211 L 96,192 112.91797,158.16211 A 79.999998,79.999998 0 0 0 176,80 79.999998,79.999998 0 0 0 96,0 Z"
            transform="scale(0.26458333)" />
       </g>
       <circle
          fill="white"
          id="path28141-9"
          cx="25.4"
          cy="21.166666"
          r="8.0850048" />
     </g>
   </g>
 </svg>`


}


const buildMultiMarker = (color: string, style: string) => {
    const fill = colorMapping[color] || color
    return `
    <svg
    viewBox="0 0 13.229166 21.695834"
    version="1.1"
    style="${style}"
    id="svg5"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:svg="http://www.w3.org/2000/svg">
    <defs
        id="defs2" />
    <g
        id="layer1">
        <g
        id="g35914"
        transform="matrix(0.298402,0,0,0.298402,-0.96482737,5.8697336)">
        <g
            id="g35909">
            <path
            id="path28141"
            fill="${fill}"
            style="stroke-width:7.55906"
            stroke="white"
            d="M 96,0 A 79.999998,79.999998 0 0 0 16,80 79.999998,79.999998 0 0 0 79.082031,158.16211 L 96,192 112.91797,158.16211 A 79.999998,79.999998 0 0 0 176,80 79.999998,79.999998 0 0 0 96,0 Z"
            transform="scale(0.26458333)" />
        </g>
        </g>
    </g>
    </svg>
    `
}




export function getLabelMarkerIcon(label: string, color: string, docCount?: number) {
    return {
      className: '',
      html: `
        <div style="display: flex; align-items: center; justify-content: center; position: relative; height: 32px;">
          ${buildMarker('color', 'position:absolute;left-0;bottom:26px;height:32px')}

          <div style="display: flex; position: absolute; top: 6px; vertical-align: middle; left: 50%; transform: translateX(-50%); background-color: white; opacity: 90%; white-space: nowrap; border-radius: 9999px; text-align: center; font-size: .75rem; font-weight: bold; padding-top: 1px; padding-bottom: 1px; padding-left: 8px; padding-right: ${docCount ? '4px' : '8px'}">
            <div style="display: flex; align-items: center; max-width: 128px !important; min-width: 0; !important; display: flex; overflow: hidden; text-overflow: ellipsis">${label}</div>&nbsp;${docCount ? `<span class="!text-xs bg-neutral-100 border border-neutral-200 flex items-center py-0 my-[0.125rem] text-neutral-950 rounded-full px-1 text-center font-normal">${docCount}</span>` : ''}
          </div>
        </div>`
    };
  }

  export function getMultiMarker(docCount: number, label: string, color: string) {
    // <img src="/markerBlackFill.svg" style="width: 3rem; height: 3rem;"/>
    return {
      className: '',
      html: `<div style="display: flex; align-items: center; justify-content: center; position: relative; height: 2rem;">
                ${buildMultiMarker(color, 'position:absolute;left-0;bottom:1.5rem;height:3rem')}
                <span class="text-white !text-xs font-bold absolute top-0 left-0 w-[3rem] text-center ">${docCount}</span>
                
                <div class="shadow-lg" style="position: absolute; top: 6px; left: 50%; transform: translateX(-50%); background-color: white; opacity: 75%; white-space: nowrap; border-radius: 9999px; text-align: center; font-size: 12px; font-weight: bold; padding: 0 8px;">
                  ${label}
                </div>
                </div>`
    }
  }