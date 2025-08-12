<template>
  <TermpostTermProp
    v-if=" bootstrapData
      && termbase === 'SNOMEDCT'
      && bootstrapData.termbase.SNOMEDCT?.versionNotesLink
    "
    :flex="true"
    :label="$t('id.version')"
  >
    <TermpostTermDescription
      :flex="true"
      :data="[
        [
          `${$t('misc.snomedVersion')}, ${localizeSnomedVersionLabel()}`,
          bootstrapData.termbase.SNOMEDCT?.versionNotesLink,
        ],
      ]"
    />
  </TermpostTermProp>
  <TermpostTermProp
    v-if=" bootstrapData
      && termbase === 'SNOMEDCT'
      && bootstrapData.termbase.SNOMEDCT.versionEdition
    "
    :flex="true"
    :label="$t('id.browser')"
  >
    <TermpostTermDescription
      :flex="true"
      :data="[
        [
          `${$t('misc.snomedBrowser')}: ${displayInfo.pagetitle.value}`,
          appConfig.tb.SNOMEDCT.browserUrl(
            bootstrapData.termbase.SNOMEDCT.versionEdition,
            conceptId,
          ),
        ],
      ]"
    />
  </TermpostTermProp>
</template>

<script setup lang="ts">
import { localizeSnomedVersionLabel } from "~/composables/locale";

const appConfig = useAppConfig();
const route = useRoute();
const bootstrapData = useBootstrapData();
const termbase = route.params.termbase as string;
const conceptId = route.params.id as string;

defineProps({
  concept: { type: Object, required: true },
  displayInfo: { type: Object, required: true },
});
</script>
