<template>
  <fieldset class="flex flex-col gap-y-1">
    <legend class="text-xl">
      {{ displaytitle() }}
    </legend>
    <slot />
  </fieldset>
</template>

<script setup lang="ts">
const searchInterface = useSearchInterface();

const props = defineProps<{
  title: string | null;
  filterKey: string; }>();

const displaytitle = () => {
  if (props.filterKey === "context") {
    if (searchInterface.value.useDomain) {
      return $t("global.domain.domainCap", 0);
    }
    return $t("global.termbase", 0);
  }
  return props.title;
};
</script>
