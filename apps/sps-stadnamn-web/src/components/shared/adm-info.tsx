'use client'

import { useSourceViewOn } from '@/lib/param-hooks';

const HIGHLIGHT_START = '[[H]]';
const HIGHLIGHT_END = '[[/H]]';

function stripHighlightMarkers(value: string): string {
  return value.split(HIGHLIGHT_START).join('').split(HIGHLIGHT_END).join('');
}

function HighlightedText({ value }: { value: string }) {
  if (!value.includes(HIGHLIGHT_START) || !value.includes(HIGHLIGHT_END)) {
    return <>{value}</>;
  }

  const parts: Array<{ text: string; highlighted: boolean }> = [];
  let cursor = 0;
  let inHighlight = false;

  while (cursor < value.length) {
    const startIdx = value.indexOf(HIGHLIGHT_START, cursor);
    const endIdx = value.indexOf(HIGHLIGHT_END, cursor);

    if (!inHighlight) {
      if (startIdx < 0) {
        parts.push({ text: value.slice(cursor), highlighted: false });
        break;
      }
      if (startIdx > cursor) {
        parts.push({ text: value.slice(cursor, startIdx), highlighted: false });
      }
      cursor = startIdx + HIGHLIGHT_START.length;
      inHighlight = true;
      continue;
    }

    if (endIdx < 0) {
      parts.push({ text: value.slice(cursor), highlighted: true });
      break;
    }

    if (endIdx > cursor) {
      parts.push({ text: value.slice(cursor, endIdx), highlighted: true });
    }
    cursor = endIdx + HIGHLIGHT_END.length;
    inHighlight = false;
  }

  return (
    <>
      {parts.map((part, idx) =>
        part.highlighted ? (
          <mark
            // eslint-disable-next-line react/no-array-index-key
            key={idx}
            className="bg-accent-100 text-inherit rounded px-0.5"
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

function pickBestHighlight(
  rawValue: string | undefined,
  highlights: Array<string | undefined>,
): string | undefined {
  if (!rawValue) return rawValue;
  for (const candidate of highlights) {
    if (!candidate) continue;
    const clean = stripHighlightMarkers(candidate);
    if (clean.localeCompare(rawValue, undefined, { sensitivity: 'accent' }) === 0) {
      return candidate;
    }
  }
  return rawValue;
}

export default function AdmInfo({ hit }: { hit: any }) {
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
  const highlight = hit.highlight || {};

  const adm1Display = pickBestHighlight(adm1, [
    isAdm1FromGroup ? highlight['group.adm1']?.[0] : undefined,
    isAdm1FromGroup ? undefined : highlight.adm1?.[0],
    highlight['group.adm1']?.[0],
    highlight.adm1?.[0],
  ]);
  const adm2Display = pickBestHighlight(adm2, [
    isAdm2FromGroup ? highlight['group.adm2']?.[0] : undefined,
    isAdm2FromGroup ? undefined : highlight.adm2?.[0],
    highlight['group.adm2']?.[0],
    highlight.adm2?.[0],
  ]);


  return (
    <>
      {adm2Display ? (
        <>
          {isAdm2FromGroup ? (
            <HighlightedText value={adm2Display} />
          ) : (
            <em>
              <HighlightedText value={adm2Display} />
            </em>
          )}
          {', '}
        </>
      ) : null}
      {adm1Display ? (
        isAdm1FromGroup ? (
          <HighlightedText value={adm1Display} />
        ) : (
          <em>
            <HighlightedText value={adm1Display} />
          </em>
        )
      ) : null}
    </>
  );
}

