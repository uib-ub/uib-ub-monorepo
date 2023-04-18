<template>
  <main>
    <Head>
      <Title
        >{{ data?.label[0]["@value"] || data?.label[0] || termbase }} |
        Termportalen</Title
      >
    </Head>
    <h1 id="main" class="pt-5 pb-2 text-2xl">
      <AppLink to="#main">
        {{ data?.label[0]["@value"] || data?.label[0] || termbase }}
      </AppLink>
    </h1>
    <div class="flex flex-col gap-x-5 gap-y-5 md:flex-row">
      <!--Description-->
      <div class="basis-GRb space-y-2">
        <p v-for="p in description" :key="p" v-html="p" />
      </div>
      <!--Table-->
      <aside class="basis-GRs">
        <table>
          <tbody>
            <!--Organisation-->
            <DataRow
              v-if="data?.publisher?.label?.['@value']"
              :data="data?.publisher?.label['@value']"
              :label="$t('termbase.organisation')"
            />
            <!--Organisation number-->
            <DataRow
              v-if="data?.publisher?.identifier"
              :data="data?.publisher?.identifier"
              :label="$t('termbase.orgnr')"
            />

            <!--Email-->
            <DataRow
              v-if="data?.contactPoint?.hasEmail"
              :data="data?.contactPoint?.hasEmail.split(':')[1]"
              :label="$t('termbase.email')"
              :to="data?.contactPoint?.hasEmail"
            />
            <!--Telephone-->
            <DataRow
              v-if="data?.contactPoint?.hasTelephone"
              :data="data?.contactPoint?.hasTelephone"
              :label="$t('termbase.telephone')"
            />
            <!--Languages-->
            <DataRow
              v-if="data?.language"
              :data="intersectUnique(languageOrder[$i18n.locale as keyof typeof languageOrder], data.language).map((lang: string) => $t(`global.lang.${lang}`, 2)) .join(', ')"
              :label="$t('global.language', 1)"
            />
            <!--Starting languages-->
            <DataRow
              v-if="data?.opprinneligSpraak"
              :data="$t('global.lang.' + data.opprinneligSpraak, 2)"
              :label="$t('termbase.startLang')"
            />
          </tbody>
        </table>
      </aside>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
const i18n = useI18n();
const route = useRoute();
const termbase = getTermbaseFromParam();
const { data } = await useLazyFetch(`/api/termbase/${termbase}`);
const description = computed(() => {
  const localLanguageOrder = languageOrder[i18n.locale.value].slice(0, 3);
  let description = "";
  for (const lang of localLanguageOrder) {
    if (data.value?.description?.[lang]) {
      try {
        description = data.value?.description?.[lang];
      } catch (e) {}
      break;
    }
  }
  return description.split("\n\n");
});

function getTermbaseFromParam() {
  const termbase = route.params.termbase;
  if (typeof termbase === "string") {
    return termbase;
  } else {
    return termbase[0];
  }
}
</script>
