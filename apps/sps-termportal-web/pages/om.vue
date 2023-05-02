<template>
  <main>
    <template v-if="$i18n.locale === 'nb'">
      <Head>
        <Title>{{ $t("om.title") }} | {{ $t("index.title") }}</Title>
      </Head>
      <h1 id="main" class="pt-5 pb-2 text-3xl">
        <AppLink to="#main">{{ $t("om.title") }} </AppLink>
      </h1>

      <div class="max-w-3xl space-y-2">
        <p>
          Dette er nettsiden til Termportalen. Siden er fortsatt under
          utvikling, så en del funksjoner er ikke på plass ennå. Arbeidet med å
          videreutvikle og utvide innholdet pågår kontinuerlig, og flere
          termbaser vil bli gjort tilgjengelig for søk etter hvert som de blir
          importert eller løsning for høsting er på plass. I tillegg opprettes
          det stadig termgrupper som gjør at antall domener og mengden
          terminologi en kan søke i, vil øke jevnt og trutt.
        </p>
        <p>
          Kontakt oss gjerne på
          <AppLink
            class="underline hover:decoration-2"
            to="mailto:termportalen@uib.no"
            >termportalen@uib.no</AppLink
          >
          for spørsmål eller tilbakemeldinger.
        </p>
      </div>
    </template>
    <template v-if="$i18n.locale === 'nn'">
      <Head>
        <Title>{{ $t("om.title") }} | {{ $t("index.title") }}</Title>
      </Head>
      <h1 id="main" class="pt-5 pb-2 text-3xl">
        <AppLink to="#main">{{ $t("om.title") }} </AppLink>
      </h1>

      <div class="max-w-3xl space-y-2">
        <p> Dette er nettsida til Termportalen. Sida er framleis under
          utvikling, så ein del funksjonar er ikkje enno på plass. Arbeidet med å
          vidareutvikle og utvide innhaldet går kontinuerleg føre seg, og fleire
          termbasar blir tilgjengelige for søk etter kvart som dei blir
          importerte eller ei løysning for hausting kjem på plass. I tillegg blir det 
          stadig oppretta nye termgrupper, derfor vil talet på domene og mengda
          terminologi ein kan søke i, øke jamnt og trutt.</p>
        <p>  Kontakt oss gjerne på
          <AppLink
            class="underline hover:decoration-2"
            to="mailto:termportalen@uib.no"
            >termportalen@uib.no</AppLink
          >   for spørsmål eller tilbakemeldingar.
        </p>
      </div>
    </template>
    <template v-if="$i18n.locale === 'en'">
      <Head>
        <Title>{{ $t("om.title") }} | {{ $t("index.title") }}</Title>
      </Head>
      <h1 id="main" class="pt-5 pb-2 text-3xl">
        <AppLink to="#main">{{ $t("om.title") }} </AppLink>
      </h1>

      <div class="max-w-3xl space-y-2">
        <p> This is Termportalen's webpage. This page is still being developed
        and some features may not be ready. The development and extension 
        of Termportalen's contents is always ongoing, and more termbases will become
        available and searcable as soon as they are imported or a solution for 
        elicitation is ready. In addition, new term groups are regularly
        created and the number of searchable domains and terms will therefore be steadily increasing. </p>
        <p> Feel free to contact us on
          <AppLink
            class="underline hover:decoration-2"
            to="mailto:termportalen@uib.no"
            >termportalen@uib.no</AppLink
          >  for questions or feedback.
        </p>
      </div>
    </template>
  </main>
</template>
