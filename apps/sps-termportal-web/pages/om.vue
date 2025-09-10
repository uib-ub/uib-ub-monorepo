<template>
  <div>
    <Head>
      <Title>{{ $t("innstillinger.title") }} | {{ $t("index.title") }}</Title>
    </Head>
    <div class="flex">
      <SideBar />
      <main class="max-w-3xl">
        <ContentRenderer
          v-if="about"
          :key="aboutKey"
          :value="about"
          class="content-wrapper"
        />
        <Accordion
          multiple
          class="mt-6"
        >
          <!-- About us -->
          <AccordionTab>
            <template #header>
              <h2 class="font-semibold">
                {{ $t("om.aboutUs") }}
              </h2>
            </template>
            <ContentRenderer
              :key="aboutUsKey"
              :value="aboutUs"
              class="content-wrapper"
            />
          </AccordionTab>
          <!-- Fagrådet -->
          <AccordionTab>
            <template #header>
              <h2 class="font-semibold">
                {{ $t("om.fagrad") }}
              </h2>
            </template>
            <ContentRenderer
              v-if="fagrad"
              :key="fagradKey"
              :value="fagrad"
              class="content-wrapper"
            />
            <div />
            <ContentRenderer
              v-if="mandate"
              :key="mandateKey"
              :value="mandate"
              class="content-wrapper"
            />
          </AccordionTab>
          <!-- History -->
          <AccordionTab>
            <template #header>
              <h2 class="font-semibold">
                {{ $t("om.history") }}
              </h2>
            </template>
            <ContentRenderer
              v-if="history"
              :key="historyKey"
              :value="history"
              class="content-wrapper"
            />
            <div />
            <ContentRenderer
              v-if="publications"
              :key="publicationsKey"
              :value="publications"
              class="content-wrapper"
            />
          </AccordionTab>
          <!-- Get started -->
          <AccordionTab>
            <template #header>
              <h2
                id="kommeiGang"
                class="font-semibold"
              >
                {{ $t("om.kommeiGang") }}
              </h2>
            </template>
            <ContentRenderer
              v-if="getStarted"
              :key="getStartedKey"
              :value="getStarted"
              class="content-wrapper"
            />
          </AccordionTab>
          <AccordionTab>
            <template #header>
              <h2 class="font-semibold">
                {{ $t("om.links") }}
              </h2>
            </template>
            <ContentRenderer
              v-if="links"
              :key="linksKey"
              :value="links"
              class="content-wrapper"
            />
          </AccordionTab>
        </Accordion>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Value } from "sass";

const locale = useLocale();

const aboutKey = computed(() => `om_main_${locale.value}`);
const { data: about, refresh: refreshAbout } = await useAsyncData(aboutKey.value, () => {
  return queryCollection("docs").path(`/web/${locale.value}/om/about`).first();
});

const aboutUsKey = computed(() => `om_aboutus_${locale.value}`);
const { data: aboutUs, refresh: refreshAboutUs } = await useAsyncData(aboutUsKey.value, () => {
  return queryCollection("docs").path(`/web/${locale.value}/om/about-us`).first();
});

const fagradKey = computed(() => `om_fagrad_${locale.value}`);
const { data: fagrad, refresh: refreshFagrad } = await useAsyncData(fagradKey.value, () => {
  return queryCollection("docs").path(`/web/${locale.value}/om/fagrad`).first();
});

const mandateKey = computed(() => `om_mandate_${locale.value}`);
const { data: mandate, refresh: refreshMandate } = await useAsyncData(mandateKey.value, () => {
  return queryCollection("docs").path(`/web/${locale.value}/om/fagrad-mandat`).first();
});

const historyKey = computed(() => `om_history_${locale.value}`);
const { data: history, refresh: refreshHistory } = await useAsyncData(historyKey.value, () => {
  return queryCollection("docs").path(`/web/${locale.value}/om/history`).first();
});

const publicationsKey = computed(() => `om_publications_${locale.value}`);
const { data: publications, refresh: refreshPublications } = await useAsyncData(publicationsKey.value, () => {
  return queryCollection("docs").path(`/web/${locale.value}/om/publications`).first();
});

const getStartedKey = computed(() => `om_getstarted_${locale.value}`);
const { data: getStarted, refresh: refreshGetStarted } = await useAsyncData(getStartedKey.value, () => {
  return queryCollection("docs").path(`/web/${locale.value}/om/get-started`).first();
});

const linksKey = computed(() => `om_links_${locale.value}`);
const { data: links, refresh: refreshLinks } = await useAsyncData(linksKey.value, () => {
  return queryCollection("docs").path(`/web/${locale.value}/om/links`).first();
});

watch(() => locale.value, () => {
  refreshAbout();
  refreshAboutUs();
  refreshFagrad();
  refreshMandate();
  refreshHistory();
  refreshPublications();
  refreshGetStarted();
  refreshLinks();
});
</script>
