import { getTranslator } from "next-intl/server";
import { notFound } from "next/navigation";
import { getSamlaIIIFv1TopCollectionData } from "lib/samla/samla.client";
import { pickSegmentFromEndOfUrl } from "utils";

type TCollection = {
  "@id": string;
  "@type": string;
  label: string;
  members: Array<TCollection>;
};

export default async function TopCollectionsRoute({
  params: { locale },
}: {
  params: {
    locale: string;
  };
}) {
  const t = await getTranslator(locale, "SamlaTopCollection");
  const data: TCollection = await getSamlaIIIFv1TopCollectionData();

  if (!data) {
    notFound();
  }

  return (
    <div>
      <h1 className="mb-10 text-4xl font-black">{t("title")}</h1>
      <ul>
        {data.members?.map((member: any) => {
          if (!member?.["@id"]) return null;
          const id = pickSegmentFromEndOfUrl(member["@id"]);
          if (!id) return null;
          return (
            <li key={member["@id"]}>
              <a href={`/samla-collections/${id.replace(".", "-")}`}>
                {member.label[1]["@value"] ?? member.label}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
