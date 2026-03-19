'use client'

import { useSourceViewOn } from '@/lib/param-hooks';

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


  return (
    <>
      {adm2 ? (
        <>
          {isAdm2FromGroup ? adm2 : <em>{adm2}</em>}
          {', '}
        </>
      ) : null}
      {adm1 ? (isAdm1FromGroup ? adm1 : <em>{adm1}</em>) : null}
    </>
  );
}

