<template>
  <article>
    <template v-if="locale === 'nb'">
      <h2 id="main" class="pb-3 text-2xl">
        <AppLink to="#main">Velkommen til Termportalen</AppLink>
      </h2>
      <div class="space-y-2">
        <p>
          Termportalen gir fri tilgang til norsk terminologi på en lang rekke
          fagområder via én felles søkerute. Du kan søke etter termer på tvers
          av domener, termbaser og språk. Termbasene er gruppert i overordnede
          domener og du kan søke etter termer enten i hele Termportalen, på ett
          spesifikt domene eller i et utvalg av termbasene. Forhåndsvalg av
          søkespråk er også mulig. De fleste termbasene har terminologi på
          bokmål, nynorsk og engelsk, mens en del termbaser også har terminologi
          på andre språk.
        </p>

        <p>
          Termportalen er en del av Språksamlingene ved Universitetet i Bergen,
          og arbeidet med terminologi skjer i samråd med Språkrådet.
          Termportalen er finansiert av Kunnskapsdepartementet og
          Kulturdepartementet.
        </p>

        <p>
          Ønsker du å komme i gang med terminologiarbeid på ditt fagområde eller
          har du terminologiske ressurser du ønsker å gjøre tilgjengelig i
          Termportalen? Ta kontakt med oss på
          <AppLink
            class="underline hover:decoration-2"
            to="mailto:termportalen@uib.no"
          >
            termportalen@uib.no</AppLink
          >. Se også
          <AppLink class="underline hover:decoration-2" to="/om#kommeiGang">{{
            $t("om.kommeiGang")
          }}</AppLink>
        </p>
      </div>
    </template>
    <template v-if="locale === 'nn'">
      <h2 id="velkommen" class="pb-3 text-2xl">
        <AppLink to="#velkommen">Velkommen til Termportalen</AppLink>
      </h2>
      <div class="space-y-2">
        <p>
          Termportalen gir fri tilgang til norsk terminologi på ei lang rekkje
          fagområde via éi felles søkerute. Du kan søke etter termar på tvers av
          domene, termbasar og språk. Termbasane er gruppert i overordna domene
          og du kan søke etter termar enten i heile Termportalen, på eit
          spesifikt domene eller i einskilde termbasar. Førehandsval av
          søkjespråk er òg mogleg. Dei fleste termbasane har terminologi på
          bokmål, nynorsk og engelsk, medan ein del termbasar òg har terminologi
          på andre språk.
        </p>

        <p>
          Termportalen er ein del av Språksamlingane ved Universitetet i Bergen,
          og arbeidet med terminologi skjer i samråd med Språkrådet.
          Termportalen er finansiert av Kunnskapsdepartementet og
          Kulturdepartementet.
        </p>

        <p>
          Ønskjer du å komme i gong med terminologiarbeid på ditt fagområde
          eller har du terminologiske ressursar du ønskjer å gjere tilgjengelege
          i Termportalen? Ta kontakt med oss på
          <AppLink
            class="underline hover:decoration-2"
            to="mailto:termportalen@uib.no"
          >
            termportalen@uib.no </AppLink
          >. Sjå også
          <AppLink class="underline hover:decoration-2" to="/om#kommeiGang">{{
            $t("om.kommeiGang")
          }}</AppLink>
        </p>
      </div>
    </template>
    <template v-if="locale === 'en'">
      <h2 id="velkommen" class="pb-3 text-2xl">
        <AppLink to="#velkommen">Welcome to Termportalen</AppLink>
      </h2>
      <div class="space-y-2">
        <p>
          Termportalen gives free access to Norwegian terminology in a number of
          subject fields through one search field. It is possible to search for
          terms across different domains, termbases or languages. The termbases
          are grouped into overall domains and you may search for terms in
          either the whole Termportalen.no, in one specific domain, or in a
          selection of termbases. You may also choose a search language in
          advance. Most of the termbases contain terminology in Norwegian
          Bokmål, Norwegian Nynorsk and English, while some termbases also
          contain terminology in other languages as well.
        </p>

        <p>
          Termportalen is part of the Norwegian Language Collections
          (Språksamlingane) at the University of Bergen, and our work is done in
          consultation with the Norwegian language council. Termportalen is
          funded by the Ministry of Education and Research and the Ministry of
          Culture and Equality.
        </p>

        <p>
          Please contact us on
          <AppLink
            class="underline hover:decoration-2"
            to="mailto:termportalen@uib.no"
          >
            termportalen@uib.no
          </AppLink>
          if you would like to get started with terminology work in your own
          subject field or if you have terminology resources that you want to
          make available in Termportalen. See also
          <AppLink class="underline hover:decoration-2" to="/om#kommeiGang">{{
            $t("om.kommeiGang")
          }}</AppLink>
          for more information.
        </p>
      </div>
    </template>
  </article>
</template>

<script setup lang="ts">
const locale = useLocale();
</script>
