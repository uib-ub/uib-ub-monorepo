import { getColors, type ColorPalette } from "@/lib/colors"
import { Color } from "@/components/colors/color"
import { ColorFormatSelector } from "@/components/colors/color-format-selector"

export function ColorPalette() {
  const colorPalettes: ColorPalette[] = getColors()
  return (
    <div className="grid grid-cols-auto gap-8 lg:gap-16 xl:gap-20">
      {colorPalettes.map((colorPalette: ColorPalette) => (
        <div id={colorPalette.name} key={colorPalette.name} className="scroll-mt-20 rounded-lg">
          <div className="flex items-center px-4">
            <div className="flex-1 pl-1 text-sm font-medium">
              <h2 className="capitalize">{colorPalette.name}</h2>
            </div>
            <ColorFormatSelector
              color={colorPalette.colors[0]}
              className="ml-auto"
            />
          </div>
          <div className="grid grid-cols-11 gap-2 py-4 sm:flex-row">
            {colorPalette.colors.map((color) => (
              <Color key={color.hex} color={color} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}