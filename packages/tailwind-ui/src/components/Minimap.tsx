import React from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps"

const geoUrl =
  "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json"

interface MinimapProps {
  label: string
  lnglat: [number, number]
}

export const Minimap = ({ label, lnglat }: MinimapProps) => {
  return (
    <div className='relative w-full' >
      <ComposableMap
        focusable={false}
        className='rounded bg-[#c6ea93] h-64 w-full dark:saturate-[.4] saturate-[.4] disabled:focus-within:'
        projection="geoAzimuthalEqualArea"
        projectionConfig={{
          //rotate: [-10.0, -52.0, 0],
          center: lnglat,
          scale: 2800
        }}>
        <Geographies geography={geoUrl} focusable={false}>
          {({ geographies }: any) =>
            geographies.map((geo: any) => (
              <Geography
                focusable={false}
                tabIndex={-1}
                className='bg-[#f7f291]'
                key={geo.rsmKey}
                geography={geo}
                fill="#f7f291"
                stroke="#61490E"
                strokeWidth={2}
                style={{
                  default: {
                    outline: "none",
                  }
                }}
              />
            ))
          }
        </Geographies>
        <Marker coordinates={lnglat} focusable={false}>
          {/* <circle r={8} fill="#F53" /> */}
          <g transform='translate(-40, -110) scale(0.3) rotate(-8)' id="SVGRepo_iconCarrier">
            <path
              style={{
                fill: "#595959",
              }}
              d="M74.031 164.559h20.667v32.805H74.031z"
            />
            <path d="m74.031 409.6-12.977-3.704V159.898h12.977V409.6ZM94.698 409.6l12.978-3.704V159.898H94.698V409.6Z" />
            <path
              style={{
                fill: "#d1d1d1",
              }}
              d="M74.031 197.363h20.667V409.6H74.031z"
            />
            <circle
              cx={84.8}
              cy={83.63}
              r={83.63}
              style={{
                fill: "#e65156",
                stroke: "#231e1b",
                strokeWidth: 15,
              }}
            />
          </g>

        </Marker>
      </ComposableMap>
    </div>
  )
}