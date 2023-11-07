import { getTranslator } from "next-intl/server";
import { notFound } from "next/navigation";
import Subjects from "@/app/[locale]/(chc)/_components/subject";
import ManifestViewer from "@/app/[locale]/(chc)/_components/iiif/manifest-viewer.client";
import { InternationalLabel } from "@/app/[locale]/(chc)/_components/international-label.client";

const url = "https://sparql.ub.uib.no/sparql/query?query=";

async function getData(id: string) {
  const res = await fetch(`http://localhost:3009/id/${id}`, {
    next: { revalidate: 10000 },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  return res.json();
}

export default async function ItemRoute({
  params: { locale, id },
}: {
  params: { locale: string; id: string };
}) {
  const t = await getTranslator(locale, "Item");
  const data = await getData(id);
  if (!data) {
    notFound();
  }

  return (
    <>
      <div>
        <InternationalLabel label={data.label} lang={locale} />
        {data.subjectOfManifest ? (
          <ManifestViewer
            id={data.subjectOfManifest}
            options={{
              canvasBackgroundColor: "#222",
              canvasHeight: "70vh",
              renderAbout: true,
              showIIIFBadge: true,
              showTitle: false,
              showInformationToggle: true,
              openSeadragon: {
                gestureSettingsMouse: {
                  scrollToZoom: false,
                },
              },
            }}
          />
        ) : null}
        <div className="my-5 flex flex-col gap-2">
          <Subjects data={data.subject} />
        </div>
      </div>
    </>
  );
}
