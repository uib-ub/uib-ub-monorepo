<template>
  <div>
    <h2 id="news" class="pb-3 text-2xl">
      <AppLink to="#news">{{ $t("news.heading") }}</AppLink>
    </h2>
    <div class="flex flex-col space-y-2">
      <div class="border border-gray-300"></div>
      <template v-if="locale === 'nb'">
        <dl class="space-y-0.5">
          <NewsItem
            title="Forslag om dobling av budsjettet til Termportalen"
            date="6.10.2023"
          >
            <p>
              Etter at regjeringens handlingsplan for norsk fagspråk i akademia
              blei offentliggjort, har det terminologiske miljøet knytta til
              Termportalen venta i spenning på statsbudsjettet.
            </p>
            <p>
              Nå er det klart at regjeringen følger opp ordene i handlingsplanen
              med bevilgninger i statsbudsjettet: Regjeringen foreslår å styre
              bevilgningen til Termportalen med fire millioner kroner.
            </p>
            <template #expand>
              <p>
                – Dette er helt fantastisk og viser at regjeringen mener alvor
                med handlingsplanen for norsk fagspråk i akademia som de la fram
                i juni, sier Marita Kristiansen, faglig leder for Termportalen.
              </p>
              <p>
                – En styrking av Termportalen med fire millioner kroner vil
                gjøre det mulig å sette fart på arbeidet med å samle og gjøre
                tilgjengelig terminologi på bokmål, nynorsk og engelsk. Vi er
                allerede godt i gang, men det er et omfattende arbeid som skal
                gjøres, og det haster, sier Kristiansen.
              </p>
              <p>
                – En økt bevilgning vil også gi rom til å videreutvikle
                samarbeidet med andre instanser som arbeider for å fremme norsk
                fagspråk, avslutter hun.
              </p>
            </template>
          </NewsItem>
        </dl>
        <div class="border border-gray-300" />
        <div class="flex flex-wrap">
          <span>
            Den 8. september arrangerte Termportalen seminar om norsk fagspråk,
            handlingsplan og terminologiarbeid i universitets- og
            høgskolesektoren
            <AppLink
              class="underline hover:decoration-2"
              to="https://www.uib.no/aktuelt/164397/fr%C3%A5-ord-til-handling-tid-terminologiarbeid-i-akademia"
            >
              Frå ord til handling: Tid for terminologiarbeid i akademia </AppLink
            >. Her kan du se opptaket av seminaret.
          </span>
        </div>
      </template>
      <template v-else-if="locale === 'nn'">
        <dl>
          <NewsItem
            title="Forslag om dobling av budsjettet til Termportalen"
            date="6.10.2023"
          >
            <p>
              Etter at regjeringa sin handlingsplan for norsk fagspråk i
              akademia blei offentleggjort, har det terminologiske miljøet knytt
              til Termportalen venta i spenning på statsbudsjettet.
            </p>
            <p>
              No er det klart at regjeringa følgjer opp orda i handlingsplanen
              med løyvingar i statsbudsjettet: Regjeringa føreslår å styrka
              løyvinga til Termportalen med fire millionar kroner.
            </p>
            <template #expand>
              <p>
                – Dette er heilt fantastisk og viser at regjeringa meiner alvor
                med handlingsplanen for norsk fagspråk i akademia som dei la
                fram i juni, seier Marita Kristiansen, fagleg leiar for
                Termportalen.
              </p>
              <p>
                – Ei styrking av Termportalen med fire millionar kroner vil
                gjera det mogleg å setja fart på arbeidet med å samla og gjera
                tilgjengeleg terminologi på bokmål, nynorsk og engelsk. Me er
                allereie godt i gang, men det er eit omfattande arbeid som skal
                gjerast, og det hastar, seier Kristiansen.
              </p>
              <p>
                – Ei auka løyving vil også gje rom til å vidareutvikla
                samarbeidet med andre instansar som arbeider for å fremja norsk
                fagspråk, avsluttar ho.
              </p>
            </template>
          </NewsItem>
        </dl>
        <div class="border border-gray-300" />
        <div>
          <span>
            Den 8. september arrangerte Termportalen seminar om norsk fagspråk,
            handlingsplan og terminologiarbeid i universitets- og
            høgskulesektoren
            <AppLink
              class="underline hover:decoration-2"
              to="https://www.uib.no/aktuelt/164397/fr%C3%A5-ord-til-handling-tid-terminologiarbeid-i-akademia"
            >
              Frå ord til handling: Tid for terminologiarbeid i akademia </AppLink
            >. Her kan du sjå opptaket av seminaret.
          </span>
        </div>
      </template>
      <template v-else>
        <span>
          On 8 September, Termportalen hosted a seminar on Norwegian language
          for specific purposes, action plans and terminology work in Norwegian
          higher education
          <AppLink
            class="underline hover:decoration-2"
            to="https://www.uib.no/aktuelt/164397/fr%C3%A5-ord-til-handling-tid-terminologiarbeid-i-akademia"
          >
            Frå ord til handling: Tid for terminologiarbeid i akademia </AppLink
          >. The recording of the seminar may be viewed here [in Norwegian].
        </span>
      </template>
      <div class="border border-gray-300"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
const locale = useLocale();

const expandNews = ref<Array<string>>([]);
</script>
