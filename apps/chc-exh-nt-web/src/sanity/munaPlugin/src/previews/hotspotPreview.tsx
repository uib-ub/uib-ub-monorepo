import { Box } from "@sanity/ui";
import { HotspotTooltipProps } from "sanity-plugin-hotspot-array";

export function HotspotPreview({
  value,
  schemaType,
  renderPreview,
}: HotspotTooltipProps) {
  return (
    <Box padding={2} style={{ minWidth: 200 }}>
      {renderPreview({
        value,
        schemaType,
        layout: "default",
      })}
    </Box>
  );
}