<template>
  <main>
    <Head>
      <Title
        >{{ data?.label[0]["@value"] || data?.label[0] || termbase }} |
        Termportalen</Title
      >
    </Head>
    <h1 id="main" class="pb-2 pt-5 text-2xl">
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
              :data="intersectUnique(localeLangOrder, data.language).map((lang: LangCode) => $t(`global.lang.${lang}`, 2)) .join(', ')"
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
import { LangCode } from "~/composables/locale";

const route = useRoute();
const termbase = getTermbaseFromParam();
const localeLangOrder = useLocaleLangOrder();

const { data } = await useLazyFetch(`/api/termbase/${termbase}`);
const description = computed(() => {
  let description = "";
  for (const lang of localeLangOrder) {
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
