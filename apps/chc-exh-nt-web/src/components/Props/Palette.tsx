import React from "react";

export const Palette = ({ colors }: any) => {
  if (!colors) return null

  let palette: any = []
  // TODO: clean up component, not elegant
  delete colors._type

  if (colors) {
    Object.values(colors).forEach((color: any) => {
      palette.push(color.background)
    })
  }

  return (
    <div className='grid grid-cols-7'>
      {palette.map((color: string, index: number) => (
        <div key={`${index}-${color}`} className={`h-2`} style={{ backgroundColor: color }}></div>
      ))}
    </div>
  )
}