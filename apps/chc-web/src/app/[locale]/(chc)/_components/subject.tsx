import { notFound } from "next/navigation";
import { useLocale } from "next-intl";
import { Badge } from "ui-react";

async function getData(id: string) {
  const res = await fetch(`http://localhost:3009/id/${id}`, {
    next: { revalidate: 10000 },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  return res.json();
}

export default async function Subjects({ data }: { data: Array<string> }) {
  if (!data) return null;
  return (
    <>
      <div className="text-xs text-gray-400">Subjects:</div>
      <div className="flex flex-wrap gap-2">
        {data.map((id) => (
          <Subject key={id} uri={id} />
        ))}
      </div>
    </>
  );
}

export async function Subject({ uri }: { uri: string }) {
  const locale = useLocale();

  // Get the ID from the URI by splitting it on `/` and taking the last part
  const id = uri.split("/").pop();

  // If there is no ID, return a 404 error
  if (!id) {
    notFound();
  }

  const data = await getData(id);

  if (!data) {
    notFound();
  }

  return (
    <Badge variant="outline">
      {data.prefLabel[locale] ?? data.prefLabel["no"]}
    </Badge>
  );
}
