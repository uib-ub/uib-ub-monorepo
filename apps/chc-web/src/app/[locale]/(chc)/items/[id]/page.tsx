import { getTranslator } from "next-intl/server";
import { notFound } from "next/navigation";
import ManifestViewer from "@/app/[locale]/(chc)/_components/iiif/manifest-viewer.client";

export default async function ItemRoute({
  params: { locale, id },
}: {
  params: { locale: string; id: string };
}) {
  const t = await getTranslator(locale, "Item");
  const res = await fetch(`http://127.0.0.1:3009/items/${id}?as=iiif`);

  if (!res.ok) {
    notFound();
  }

  const data = await res.json();

  // TODO: the viewer will change height when navigating between canvases
  // because we have level 0 Image api, and do not have the dimensions of the images.

  return (
    <>
      <div>
        {data ? (
          <ManifestViewer
            id={data}
            options={{
              canvasBackgroundColor: "#222",
              canvasHeight: "640px",
              renderAbout: true,
              showIIIFBadge: true,
              showTitle: true,
              showInformationToggle: true,
              openSeadragon: {
                gestureSettingsMouse: {
                  scrollToZoom: false,
                },
              },
            }}
          />
        ) : null}
      </div>
    </>
  );
}
