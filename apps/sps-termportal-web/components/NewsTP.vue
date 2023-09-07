<template>
  <div>
    <h2 id="news" class="pb-3 text-2xl">
      <AppLink to="#news">{{ $t("news.heading") }}</AppLink>
    </h2>
    <div class="flex flex-col gap-2">
      <div class="border border-gray-300"></div>
      <div v-if="locale === 'nb'">
        <div class="flex flex-wrap">
          <dt class="font-semibold">8. september:</dt>
          <dd>
            <span>
              Seminar om norsk fagspråk, handlingsplan og terminologiarbeid i
              universitets- og høgskolesektoren
              <AppLink
                class="underline hover:decoration-2"
                to="https://www.uib.no/aktuelt/164397/fr%C3%A5-ord-til-handling-tid-terminologiarbeid-i-akademia"
              >
                Frå ord til handling: Tid for terminologiarbeid i akademia
              </AppLink>
              Seminaret blir strømmet og tegnspråktolket.
            </span>
          </dd>
        </div>
      </div>
      <div v-else-if="locale === 'nn'">
        <dl class="flex flex-wrap">
          <dt class="font-semibold">8. september:</dt>
          <dd>
            Seminar om norsk fagspråk, handlingsplan og terminologiarbeid i
            universitets- og høgskulesektoren
            <AppLink
              class="underline hover:decoration-2"
              to="https://www.uib.no/aktuelt/164397/fr%C3%A5-ord-til-handling-tid-terminologiarbeid-i-akademia"
            >
              Frå ord til handling: Tid for terminologiarbeid i akademia
            </AppLink>
            Seminaret blir strøyma og teiknspråktolka.
          </dd>
        </dl>
      </div>
      <div v-else>
        <dl class="flex flex-wrap">
          <dt class="font-semibold">8 September:</dt>
          <dd>
            Seminar on Norwegian language for specific purposes, action plans
            and terminology work in Norwegian higher education
            <AppLink
              class="underline hover:decoration-2"
              to="https://www.uib.no/aktuelt/164397/fr%C3%A5-ord-til-handling-tid-terminologiarbeid-i-akademia"
            >
              Frå ord til handling: Tid for terminologiarbeid i akademia
            </AppLink>
            The seminar will be streamed and sign interpreted [in Norwegian].
          </dd>
        </dl>
      </div>
      <div class="border border-gray-300"></div>
    </div>
  </div>
</template>
<script setup lang="ts">
const locale = useLocale();
</script>
