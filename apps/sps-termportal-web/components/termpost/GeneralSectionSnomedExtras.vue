<template>
  <TermpostTermProp
    v-if="
      termbase === 'SNOMEDCT' &&
      bootstrapData.termbase.SNOMEDCT?.versionNotesLink
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
    v-if="
      termbase === 'SNOMEDCT' &&
      bootstrapData.termbase.SNOMEDCT?.versionNotesLink
    "
    :flex="true"
    :label="$t('id.browser')"
  >
    <TermpostTermDescription
      :flex="true"
      :data="[
        [
          `${$t('misc.snomedBrowser')}: ${displayInfo.pagetitle.value}`,
          termbaseConfig.SNOMEDCT.browserUrl(
            bootstrapData.termbase.SNOMEDCT.versionEdition,
            conceptId
          ),
        ],
      ]"
    />
  </TermpostTermProp>
</template>

<script setup lang="ts">
import { localizeSnomedVersionLabel } from "~/composables/locale";
import { termbaseConfig } from "~/utils/vars-termbase";

const route = useRoute();
const bootstrapData = useBootstrapData();
const termbase = route.params.termbase as string;
const conceptId = route.params.id as string;

const props = defineProps({
  concept: { type: Object, required: true },
  displayInfo: { type: Object, required: true },
});
</script>
