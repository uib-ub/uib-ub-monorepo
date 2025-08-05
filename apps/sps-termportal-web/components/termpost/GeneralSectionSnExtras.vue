<template>
  <TermpostTermProp
    v-if="termbase === 'SN' && concept.wasClassifiedAs"
    :flex="true"
    :label="$t('id.icsCode')"
  >
    <TermpostTermDescription
      :flex="true"
      :data="[concept.wasClassifiedAs?.join(', ')]"
    />
  </TermpostTermProp>
  <TermpostTermProp
    v-if="termbase === 'SN' && concept?.wasDerivedFrom"
    :flex="true"
    :label="$t('id.source')"
  >
    <TermpostTermDescription
      :flex="true"
      :data="concept?.wasDerivedFrom.map((standard: string) => {
          return [standard, standardIdToUrl(standard)]; })"
    />
  </TermpostTermProp>
  <TermpostTermProp
    v-if="termbase === 'SN'"
    :flex="true"
    :label="$t('id.browser')"
  >
    <TermpostTermDescription
      :key="`${termbaseConfig.SN.termlexTermpostBaseUrl}/${conceptId}/${locale}`"
      :flex="true"
      :data="[
        [
          `Termlex.no`,
          `${termbaseConfig.SN.termlexTermpostBaseUrl}/${conceptId}/${
            displayInfo?.conceptLanguages?.includes(locale) ? locale : 'nb'
          }`,
        ],
      ]"
    />
  </TermpostTermProp>
</template>

<script setup lang="ts">
import { termbaseConfig } from "~/utils/vars-termbase";

const route = useRoute();
const locale = useLocale();
const termbase = route.params.termbase as string;
const conceptId = route.params.id as string;

const props = defineProps({
  concept: { type: Object, required: true },
  displayInfo: { type: Object, required: true },
});

function standardIdToUrl(standardId: string) {
  return (
    termbaseConfig.SN.standardOnlineBaseUrl +
    standardId
      .toLowerCase()
      .replaceAll(" ", "-")
      .replaceAll(":", "-")
      .replaceAll("/", "")
      .replaceAll("+", "")
  );
}
</script>
