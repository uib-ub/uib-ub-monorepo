import { getTranslator } from "next-intl/server";
import { notFound } from "next/navigation";
import { getSamlaIIIFv2RecordData } from "lib/samla/samla.client";
import { SamlaRecordPage } from "@/app/[locale]/(chc)/_components/samla-record-page";

export default async function SamlaRecordRoute({
  params: { locale, id },
}: {
  params: { locale: string; id: string };
}) {
  const t = await getTranslator(locale, "Item");
  const itemData = await getSamlaIIIFv2RecordData(id);

  if (!itemData) {
    notFound();
  }

  return (
    <div>
      <span className="block text-right text-xs">{t("greeting")}</span>
      <SamlaRecordPage data={itemData} locale={locale} />
    </div>
  );
}
