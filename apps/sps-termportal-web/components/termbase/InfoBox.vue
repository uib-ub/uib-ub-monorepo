<template>
  <aside
    class="flex h-fit w-fit min-w-fit max-w-[25rem] flex-col space-y-4 rounded-[7px] border lg:border-gray-300 border-transparent lg:px-3 lg:pb-3 lg:pt-2"
  >
    <div>
      <h2 id="tbcontact" class="text-xl">
        {{ $t("termbase.contactHeading") }}
      </h2>
      <dl aria-labelledby="tbcontact" class="space-y-0.5">
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
      <dl aria-labelledby="tbtermbaseinfo" class="space-y-0.5">
        <div v-if="termbaseId === 'SNOMEDCT'" class="flex">
          <dt class="w-32 shrink-0 font-semibold">
            {{ $t("id.version") }}
          </dt>
          <dd>
            <AppLink
              class="underline hover:decoration-2"
              :to="bootstrapData.termbase.SNOMEDCT.versionNotesLink"
              >{{ localizeSnomedVersionLabel() }}
            </AppLink>
          </dd>
        </div>
        <div v-if="bootstrapData?.termbase?.concepts" class="flex">
          <dt class="w-32 shrink-0 font-semibold">
            {{ $t("global.concept", 2) }}
          </dt>
          <dd>
            {{ bootstrapData?.termbase?.concepts }}
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
          <dd class="max-w-xs">
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
</template>

<script setup lang="ts">
import { LangCode, localizeSnomedVersionLabel } from "~/composables/locale";

const localeLangOrder = useLocaleLangOrder();
const bootstrapData = useBootstrapData();

const props = defineProps({
  data: { type: Object, required: true },
  termbaseId: { type: String, required: true },
});
</script>
