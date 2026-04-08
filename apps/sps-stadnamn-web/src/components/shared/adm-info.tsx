'use client'

import { useSourceViewOn } from '@/lib/param-hooks';

function normalizeWords(s: string): string[] {
  return (s || '')
    .trim()
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

function highlightText(value: string, query: string) {
  const qWords = normalizeWords(query);
  if (!qWords.length) return <>{value}</>;

  const lower = value.toLowerCase();
  const wordRe = /(^|[^\p{L}\p{N}]+)([\p{L}\p{N}]+)/gu;
  const ranges: Array<{ start: number; end: number }> = [];

  for (const m of lower.matchAll(wordRe)) {
    const full = m[0] || '';
    const token = m[2] || '';
    if (!token) continue;
    const start = (m.index ?? 0) + (full.length - token.length);

    let bestLen = 0;
    for (const q of qWords) {
      if (token.startsWith(q) && q.length > bestLen) bestLen = q.length;
    }
    if (bestLen > 0) {
      ranges.push({ start, end: start + bestLen });
    }
  }

  if (!ranges.length) return <>{value}</>;

  const out: Array<{ text: string; highlighted: boolean }> = [];
  let i = 0;
  for (const r of ranges) {
    if (r.start > i) out.push({ text: value.slice(i, r.start), highlighted: false });
    out.push({ text: value.slice(r.start, r.end), highlighted: true });
    i = r.end;
  }
  if (i < value.length) out.push({ text: value.slice(i), highlighted: false });

  return (
    <>
      {out.map((part, idx) =>
        part.highlighted ? (
          <mark
            // eslint-disable-next-line react/no-array-index-key
            key={idx}
          >
            {part.text}
          </mark>
        ) : (
          // eslint-disable-next-line react/no-array-index-key
          <span key={idx}>{part.text}</span>
        ),
      )}
    </>
  );
}

export default function AdmInfo({ hit, query = '' }: { hit: any; query?: string }) {
  const sourceViewOn = useSourceViewOn();

  const groupAdm1 = hit.fields?.['group.adm1']?.[0] || hit.fields?.group?.adm1?.[0];
  const groupAdm2 = hit.fields?.['group.adm2']?.[0] || hit.fields?.group?.adm2?.[0];
  const directAdm1 = hit.fields?.adm1?.[0] || hit.adm1?.[0];
  const directAdm2 = hit.fields?.adm2?.[0] || hit.adm2?.[0];

  const useGroupAdm = !sourceViewOn;

  // When sourceView is OFF: prefer group-level adm, fallback to direct.
  // When sourceView is ON: prefer direct adm, fallback to group-level.
  const adm1 = useGroupAdm
    ? (groupAdm1 ?? directAdm1)
    : (directAdm1 ?? groupAdm1);
  let adm2 = useGroupAdm
    ? (groupAdm2 ?? directAdm2)
    : (directAdm2 ?? groupAdm2);

  if (!adm1 && !adm2) return null;

  if (adm2 === adm1) adm2 = undefined;

  const isAdm1FromGroup = !!groupAdm1 && adm1 === groupAdm1;
  const isAdm2FromGroup = !!groupAdm2 && adm2 === groupAdm2;


  return (
    <>
      {adm2 ? (
        <>
          {isAdm2FromGroup ? (
            highlightText(adm2, query)
          ) : (
            <em>
              {highlightText(adm2, query)}
            </em>
          )}
          {', '}
        </>
      ) : null}
      {adm1 ? (
        isAdm1FromGroup ? (
          highlightText(adm1, query)
        ) : (
          <em>
            {highlightText(adm1, query)}
          </em>
        )
      ) : null}
    </>
  );
}

