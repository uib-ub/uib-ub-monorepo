import Link from "next/link";
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

const toSearchHref = (params: Record<string, string>) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) search.set(key, value);
  });
  return `/search?${search.toString()}`;
};

export default function CadastralSearchLinks({ source, dataset }: CadastralSearchLinksProps) {
  if (!source || source.within) return null;

  const knr = toFirst(source.knr) || toFirst(source?.misc?.KNR) || toFirst(source?.misc?.knr);

  const chipsFromCadastre = (Array.isArray(source.cadastre) ? source.cadastre : [])
    .map((item: any, index: number) => {
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
      const href = toSearchHref({
        dataset,
        ...(gnr ? { gnr } : {}),
        ...(bnr ? { bnr } : {}),
        ...(mnr ? { mnr } : {}),
        ...(lnr ? { lnr } : {}),
        ...(knr ? { knr } : {}),
      });
      return { key: `${label}-${index}`, label, href };
    })
    .filter(Boolean) as { key: string; label: string; href: string }[];

  const fallbackPrimary = toFirst(source.gnr) || toFirst(source.mnr);
  const fallbackSecondary = toFirst(source.bnr) || toFirst(source.lnr);
  const fallbackSeparator = (toFirst(source.mnr) || toFirst(source.lnr)) && !(toFirst(source.gnr) || toFirst(source.bnr)) ? "." : "/";
  const fallbackBaseLabel = fallbackSecondary ? `${fallbackPrimary}${fallbackSeparator}${fallbackSecondary}` : fallbackPrimary;
  const fallbackLabel = knr ? `${knr}-${fallbackBaseLabel}` : fallbackBaseLabel;
  const fallbackChip = fallbackPrimary
    ? [{
      key: fallbackLabel,
      label: fallbackLabel,
      href: toSearchHref({
        dataset,
        ...(toFirst(source.gnr) ? { gnr: toFirst(source.gnr) } : {}),
        ...(toFirst(source.bnr) ? { bnr: toFirst(source.bnr) } : {}),
        ...(toFirst(source.mnr) ? { mnr: toFirst(source.mnr) } : {}),
        ...(toFirst(source.lnr) ? { lnr: toFirst(source.lnr) } : {}),
        ...(knr ? { knr } : {}),
      }),
    }]
    : [];

  const chips = chipsFromCadastre.length > 0 ? chipsFromCadastre : fallbackChip;
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <h3 className="font-semibold !text-base !m-0 !p-0 !font-sans">Matrikkel:</h3>
      {chips.map((chip) => (
        <Link key={chip.key} href={chip.href} className="no-underline flex items-center gap-1">
          {chip.label}
          <PiMagnifyingGlass className="text-primary-700" aria-hidden="true" />
        </Link>
      ))}
    </div>
  );
}
