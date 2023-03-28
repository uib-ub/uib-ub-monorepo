<template>
  <main>
    <Head>
      <Title
        >{{ uriData?.label[0]["@value"] || uriData?.label[0] || samling }} |
        Termportalen</Title
      >
    </Head>
    <h1 id="main" class="pt-5 pb-2 text-2xl">
      <AppLink to="#main">
        {{ uriData?.label[0]["@value"] || uriData?.label[0] || samling }}
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
              v-if="orgData?.label?.['@value']"
              :data="orgData.label['@value']"
              :label="$t('samling.organisation')"
            />
            <!--Organisation number-->
            <DataRow
              v-if="orgData?.identifier"
              :data="orgData.identifier"
              :label="$t('samling.orgnr')"
            />

            <!--Email-->
            <DataRow
              v-if="contactData?.hasEmail"
              :data="contactData.hasEmail.split(':')[1]"
              :label="$t('samling.email')"
              :to="contactData.hasEmail"
            />
            <!--Telephone-->
            <DataRow
              v-if="contactData?.hasTelephone"
              :data="contactData?.hasTelephone"
              :label="$t('samling.telephone')"
            />
            <!--Languages-->
            <DataRow
              v-if="uriData?.language"
              :data="intersectUnique(languageOrder[$i18n.locale as keyof typeof languageOrder], uriData.language).map((lang: string) => $t(`global.lang.${lang}`, 2)) .join(', ')"
              :label="$t('global.language', 1)"
            />
            <!--Starting languages-->
            <DataRow
              v-if="uriData?.opprinneligSpraak"
              :data="$t('global.lang.' + uriData.opprinneligSpraak, 2)"
              :label="$t('samling.startLang')"
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
const runtimeConfig = useRuntimeConfig();

const route = useRoute();
const samling = getSamlingFromParam();
const uri = `${samling}-3A${samling}`;
const samlingData = ref();
const displayData = computed(() => {
  return identifyData(samlingData.value?.["@graph"]);
});
const uriData = computed(() => {
  idSubobjectsWithLang(displayData.value, [uri], ["description"]);
  return displayData.value?.[uri];
});

const description = computed(() => {
  const localLanguageOrder = languageOrder[i18n.locale.value].slice(0, 3);
  let description = "";
  for (const lang of localLanguageOrder) {
    if (uriData.value?.description?.[lang]) {
      try {
        description = uriData.value?.description?.[lang][0]["@value"];
      } catch (e) {}
      break;
    }
  }
  return description.split("\n\n");
});

const orgData = computed(() => {
  return displayData.value?.[`${uri}-23org`];
});
const contactData = computed(() => {
  return displayData.value?.[`${uri}-23contact`];
});

function getSamlingFromParam() {
  const samling = route.params.samling;
  if (typeof samling === "string") {
    return samling;
  } else {
    return samling[0];
  }
}

async function fetchSamlingData() {
  const data = await fetchData(genSamlingQuery(samling), "application/ld+json");
  samlingData.value = await compactData(data, runtimeConfig.public.base);
}
fetchSamlingData();
</script>
