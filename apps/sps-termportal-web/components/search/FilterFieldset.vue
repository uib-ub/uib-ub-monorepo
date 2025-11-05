<template>
  <fieldset class="flex flex-col gap-y-1">
    <legend class="text-xl">
      {{ displaytitle() }}
    </legend>
    <slot />
  </fieldset>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const i18n = useI18n();
const searchInterface = useSearchInterface();

const props = defineProps<{
  title: string | null;
  filterKey: string; }>();

const displaytitle = () => {
  if (props.filterKey === "context") {
    if (searchInterface.value.useDomain) {
      return i18n.t("global.domain.domainCap", 0);
    }
    return i18n.t("global.termbase", 0);
  }
  return props.title;
};
</script>
