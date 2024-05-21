<template>
  <fieldset class="flex flex-col gap-y-1">
    <legend class="text-xl">{{ displaytitle() }}</legend>
    <slot />
  </fieldset>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const i18n = useI18n();
const searchInterface = useSearchInterface();

const props = defineProps({
  title: { type: String, required: true },
  fkey: { type: String, default: null },
});

const displaytitle = () => {
  if (props.fkey === "context") {
    if (searchInterface.value.useDomain) {
      return i18n.t("global.domain.domain");
    } else {
      return i18n.t("global.termbase", 0);
    }
  } else {
    return props.title;
  }
};
</script>
