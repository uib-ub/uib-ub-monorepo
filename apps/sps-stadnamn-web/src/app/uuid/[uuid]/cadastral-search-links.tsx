import Clickable from "@/components/ui/clickable/clickable";
import { PiMagnifyingGlass } from "react-icons/pi";

type CadastralSearchLinksProps = {
  source: Record<string, any>;
  dataset: string;
};

const toFirst = (value: unknown): string => {
  if (Array.isArray(value)) return value[0] != null ? String(value[0]).trim() : "";
  if (value == null) return "";
  return String(value).trim();
};

export default function CadastralSearchLinks({ source }: CadastralSearchLinksProps) {
  if (!source || source.within) return null;

  const knr = toFirst(source.knr) || toFirst(source?.misc?.KNR) || toFirst(source?.misc?.knr);
  const toChip = (item: Record<string, any>, key: string) => {
    const gnr = toFirst(item?.gnr);
    const bnr = toFirst(item?.bnr);
    const mnr = toFirst(item?.mnr);
    const lnr = toFirst(item?.lnr);
    const primary = gnr || mnr;
    const secondary = bnr || lnr;
    if (!primary && !secondary) return null;

    const separator = (mnr || lnr) && !(gnr || bnr) ? "." : "/";
    const baseLabel = secondary ? `${primary}${separator}${secondary}` : primary;
    const label = knr ? `${knr}-${baseLabel}` : baseLabel;

    return {
      key: `${key}-${label}`,
      label,
      params: {
        sourceView: "on",
        ...(gnr ? { gnr } : {}),
        ...(bnr ? { bnr } : {}),
        ...(mnr ? { mnr } : {}),
        ...(lnr ? { lnr } : {}),
        ...(knr ? { knr } : {}),
      },
    };
  };

  const chipsFromCadastre = (Array.isArray(source.cadastre) ? source.cadastre : [])
    .map((item: Record<string, any>, index: number) => toChip(item, String(index)))
    .filter((chip): chip is NonNullable<ReturnType<typeof toChip>> => Boolean(chip));

  const fallbackChip = toChip(source, "fallback");
  const chips = chipsFromCadastre.length > 0 ? chipsFromCadastre : fallbackChip ? [fallbackChip] : [];
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 items-baseline">
      <h3 className="font-semibold !text-base !m-0 !p-0 !font-sans leading-none">Matrikkel:</h3>
      {chips.map((chip) => (
        <Clickable
          key={chip.key}
          link
          href="/search"
          only={chip.params}
          className="no-underline inline-flex items-baseline gap-1 leading-none"
        >
          {chip.label}
          <PiMagnifyingGlass className="text-primary-700" aria-hidden="true" />
        </Clickable>
      ))}
    </div>
  );
}
