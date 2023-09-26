<template>
  <div>
    <h2 id="news" class="pb-3 text-2xl">
      <AppLink to="#news">{{ $t("news.heading") }}</AppLink>
    </h2>
    <div class="flex flex-col gap-2">
      <div class="border border-gray-300"></div>
      <div v-if="locale === 'nb'">
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
      </div>
      <div v-else-if="locale === 'nn'">
        <span>
          Den 8. september arrangerte Termportalen seminar om norsk fagspråk,
          handlingsplan og terminologiarbeid i universitets- og høgskulesektoren
          <AppLink
            class="underline hover:decoration-2"
            to="https://www.uib.no/aktuelt/164397/fr%C3%A5-ord-til-handling-tid-terminologiarbeid-i-akademia"
          >
            Frå ord til handling: Tid for terminologiarbeid i akademia </AppLink
          >. Her kan du sjå opptaket av seminaret.
        </span>
      </div>
      <div v-else>
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
      </div>
      <div class="border border-gray-300"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
const locale = useLocale();
</script>
