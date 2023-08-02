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
          domener og du kan søke etter termer enten i hele Termportalen.no, innen
          ett spesifikt domene eller i et utvalg av termbasene. Forhåndsvalg av
          søkespråk er også mulig. De fleste termbasene har terminologi på
          bokmål, nynorsk og engelsk, mens en del termbaser også har terminologi
          på andre språk.
        </p>
        <p>
          I tillegg til søkesiden til Termportalen er det utviklet en
          redigeringsapplikasjon som kan brukes fritt til registrering av
          terminologi. Ta kontakt med oss på
          <AppLink
            class="underline hover:decoration-2"
            to="mailto:termportalen@uib.no"
          >
            termportalen@uib.no
          </AppLink>
          dersom du ønsker å komme i gang med terminologiarbeid på ditt
          fagområde.
        </p>
        <p>
          Termportalen er en del av Språksamlingene ved Universitetet i Bergen,
          og arbeidet med terminologi skjer i samråd med Språkrådet.
          Termportalen er finansiert av Kunnskapsdepartementet og Kultur- og
          likestillingsdepartementet.
        </p>
      </div>
    </template>
    <template v-if="locale === 'nn'">
      <h2 id="velkommen" class="pb-3 text-2xl">
        <AppLink to="#velkommen">Velkommen til Termportalen</AppLink>
      </h2>
      <div class="space-y-2">
        <p> Termportalen gir fri tilgang til norsk terminologi på ei lang rekke
          fagområde via éi felles søkerute. Du kan søke etter termar på tvers
          av domene, termbasar og språk. Termbasane er grupperte i overordna
          domene og du kan søke etter termar enten i heile Termportalen.no, innan
          eitt spesifikt domene eller i eit utval av termbasane. Du kan òg velje 
          søkespråk på førehand. Dei fleste termbasane har terminologi på
          bokmål, nynorsk og engelsk, mens ein del termbasar òg har terminologi
          på andre språk.</p>
        <p>
          I tillegg til søkesida til Termportalen har det blitt utvikla ein
          redigeringsapplikasjon som kan brukast fritt til registrering av
          terminologi. Ta kontakt med oss på
          <AppLink
            class="underline hover:decoration-2"
            to="mailto:termportalen@uib.no"
          >
            termportalen@uib.no
          </AppLink>
          om du ønsker å komme i gang med terminologiarbeid på fagområdet ditt.
             </p>
        <p>
          Termportalen er ein del av Språksamlingane ved Universitetet i Bergen,
          og arbeidet med terminologi skjer i samråd med Språkrådet.
          Termportalen er finansiert av Kunnskapsdepartementet og Kultur- og
          likestillingsdepartementet.</p>
      </div>
    </template>
    <template v-if="locale === 'en'">
      <h2 id="velkommen" class="pb-3 text-2xl">
        <AppLink to="#velkommen">Welcome to Termportalen</AppLink>
      </h2>
      <div class="space-y-2">
        <p> Termportalen provides free access to Norwegian terminology in many different 
          subject fields through one search field. It is possible to search for terms 
          across different domains, termbases and languages. The termbases are grouped into
          overall domains and you may search for terms in either the whole 
          Termportalen.no, in one specific domain, or in a selection of termbases.
          You may also choose a search language in advance. Most of the termbases contain 
          terminology in Norwegian Bokmål, Norwegian Nynorsk and English, while some
          termbases also contain terminology in other languages as well. </p>
        <p>
        In addition to Termportalen's search interface, we have developed a terminology management 
        application for registration of terminology. Please contact us on
          <AppLink
            class="underline hover:decoration-2"
            to="mailto:termportalen@uib.no"
          >
            termportalen@uib.no
          </AppLink>
          if you want to get started with terminology work in your own subject field.
        </p>
        <p>Termportalen is a part of the Norwegian Language Collections (Språksamlingane) at the University of Bergen,
          and the terminology work is done in consultation with the Language Council of Norway.
          Termportalen is funded by the Ministry of Education and Research and
          the Ministry of Culture and Equality.</p>
      </div>
    </template>
  </article>
</template>

<script setup lang="ts">
const locale = useLocale();
</script>
