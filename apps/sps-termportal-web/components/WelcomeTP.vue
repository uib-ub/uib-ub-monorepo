<template>
  <article>
    <template v-if="$i18n.locale === 'nb'">
      <h2 id="main" class="pb-3 text-2xl">
        <AppLink to="#main">Velkommen til Termportalen</AppLink>
      </h2>
      <div class="space-y-2">
        <p>
          Termportalen gir fri tilgang til norsk terminologi på en lang rekke
          fagområder via én felles søkerute. Du kan søke etter termer på tvers
          av domener, termbaser og språk. Termbasene er gruppert i overordnede
          domener og du kan søke etter termer enten i hele Termportalen.no, på
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
    <template v-if="$i18n.locale === 'nn'">
      <h2 id="velkommen" class="pb-3 text-2xl">
        <AppLink to="#velkommen"></AppLink>
      </h2>
    </template>
    <template v-if="$i18n.locale === 'en'">
      <h2 id="velkommen" class="pb-3 text-2xl">
        <AppLink to="#velkommen"></AppLink>
      </h2>
    </template>
  </article>
</template>
