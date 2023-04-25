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
        <p></p>
        <p>
          <AppLink
            class="underline hover:decoration-2"
            to="mailto:termportalen@uib.no"
            >termportalen@uib.no</AppLink
          >
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
        <p></p>
        <p>
          <AppLink
            class="underline hover:decoration-2"
            to="mailto:termportalen@uib.no"
            >termportalen@uib.no</AppLink
          >
        </p>
      </div>
    </template>
  </main>
</template>
