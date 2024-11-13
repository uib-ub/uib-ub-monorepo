import SubpageNav from '@/components/layout/subpage-nav'

export const metadata = { title: 'Info' }

export default function InfoPage() {
  return (
    <div className="prose max-w-none">
      <h1>Om Stadnamnportalen</h1>

      <p>
        Stadnamnportalen er ei samla vising av alle digitale kjelder til stadnamn i Språksamlingane. 
        På lenger sikt er det meininga at alle institusjonar som ynskjer å bidra med digitale 
        stadnamn, kan få data lagt til.
      </p>

      <p>
        Portalen har resultatvising og kartvising for alle kartfesta namn. Kartfesting er gjort 
        ved hjelp av moderne koordinatsette stadnamn frå Sentralt stadnamnregister og frå den 
        digitale matrikkelen til Statens kartverk. Sidan det ikkje alltid er mogleg å stadfeste 
        stader heilt presist, er det i kartfestinga angitt grader av presisjon, der dei mest 
        presise lokaliseringane er angitt med: lokalitetspunkt, adressepunkt og bygningspunkt, 
        og dei minst presise har angivingane hovudteigssentroide og gardsnummerentroide.
      </p>

      <p>
        Det vert lagt til nye datasett med jamne mellomrom, etterkvart som dei vert gjort ferdige.
      </p>

      <SubpageNav 
        items={[
          { label: "Om Stadnamnsøk", href: "info/search" },
          { label: "Datasett", href: "info/datasets" },
          { label: "Personvern", href: "info/privacy" },
          { label: "Opphavsrett", href: "info/license" }
        ]}
      />
    </div>
  )
}