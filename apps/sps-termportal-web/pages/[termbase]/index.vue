<template>
  <div class="flex">
    <Head>
      <Title>{{ lalof(termbase + "-3A" + termbase) }} | Termportalen</Title>
    </Head>
    <div class="flex">
      <SideBar />
      <main>
        <h1 id="main" class="pb-3 pt-5 text-2xl">
          <AppLink to="#main">
            {{ lalof(termbase + "-3A" + termbase) }}
          </AppLink>
        </h1>
        <div class="flex flex-col gap-x-5 gap-y-5 lg:flex-row">
          <!--Description-->
          <div class="max-w-prose basis-GRb space-y-2">
            <p v-for="p in description" :key="p" v-html="p" />
          </div>
          <!--deflist-->
          <aside
            class="flex h-fit w-fit max-w-[25rem] flex-col gap-y-4 rounded-[7px] border border-gray-300 p-3"
          >
            <div>
              <h2 id="tbcontact" class="text-lg font-semibold">
                {{ $t("termbase.contactHeading") }}
              </h2>
              <dl aria-labelledby="tbcontact">
                <div v-if="data?.publisher?.label?.['@value']" class="flex">
                  <dt class="w-32 shrink-0 font-semibold">
                    {{ $t("termbase.organisation") }}
                  </dt>
                  <dd class="col-span-2">
                    {{ data?.publisher?.label["@value"] }}
                  </dd>
                </div>
                <div v-if="data?.publisher?.identifier" class="flex">
                  <dt class="w-32 shrink-0 font-semibold">
                    {{ $t("termbase.orgnr") }}
                  </dt>
                  <dd class="">{{ data?.publisher?.identifier }}</dd>
                </div>
                <div v-if="data?.contactPoint?.hasEmail" class="flex">
                  <dt class="w-32 shrink-0 font-semibold">
                    {{ $t("termbase.email") }}
                  </dt>
                  <dd class="">
                    <AppLink
                      class="underline hover:decoration-2"
                      :to="data?.contactPoint?.hasEmail"
                      >{{ data?.contactPoint?.hasEmail.split(":")[1] }}</AppLink
                    >
                  </dd>
                </div>
                <div v-if="data?.contactPoint?.hasTelephone" class="flex">
                  <dt class="w-32 font-semibold">
                    {{ $t("termbase.telephone") }}
                  </dt>
                  <dd class="">{{ data?.contactPoint?.hasTelephone }}</dd>
                </div>
              </dl>
            </div>
            <div>
              <h2 id="tbtermbaseinfo" class="text-lg font-semibold">
                {{ $t("global.termbase", 0) }}
              </h2>
              <dl aria-labelledby="tbtermbaseinfo">
                <div v-if="termbase === 'SNOMEDCT'" class="flex">
                  <dt class="w-32 shrink-0 font-semibold">
                    {{ $t("id.version") }}
                  </dt>
                  <dd>
                    <AppLink
                      class="underline hover:decoration-2"
                      :to="termbaseData.SNOMEDCT.versionNotesLink"
                      >{{ localizeSnomedVersionLabel() }}
                    </AppLink>
                  </dd>
                </div>

                <div v-if="data?.license" class="flex">
                  <dt class="w-32 shrink-0 font-semibold">
                    {{ $t("termbase.license", 1) }}
                  </dt>
                  <dd>
                    <AppLink
                      v-if="licenseLinks[data?.license['@id']]"
                      class="underline hover:decoration-2"
                      :to="licenseLinks[data?.license?.['@id']]"
                      >{{ licenseLabels[data?.license?.["@id"]] }}</AppLink
                    >
                    <span v-else class="">
                      {{ licenseLabels[data?.license?.["@id"]] }}
                    </span>
                  </dd>
                </div>
                <div v-if="data?.language" class="flex">
                  <dt class="w-32 shrink-0 font-semibold">
                    {{ $t("global.language", 1) }}
                  </dt>
                  <dd class="">
                    {{
                      intersectUnique(localeLangOrder, data.language)
                        .map((lang: LangCode) => $t(`global.lang.${lang}`, 2))
                        .join(", ")
                    }}
                  </dd>
                </div>
                <div v-if="data?.opprinneligSpraak" class="flex">
                  <dt class="w-32 font-semibold">
                    {{ $t("termbase.startLang") }}
                  </dt>
                  <dd class="">
                    {{ $t("global.lang." + data.opprinneligSpraak, 2) }}
                  </dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LangCode, localizeSnomedVersionLabel } from "~/composables/locale";

const route = useRoute();
const termbase = getTermbaseFromParam();
const localeLangOrder = useLocaleLangOrder();
const termbaseData = useTermbaseData();

const { data } = await useLazyFetch(`/api/termbase/${termbase}`, {
  key: `termbase_${termbase}`,
  headers: process.server
    ? { cookie: "session=" + useRuntimeConfig().apiKey }
    : undefined,
});
const description = computed(() => {
  let description = "";
  for (const lang of localeLangOrder.value) {
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
