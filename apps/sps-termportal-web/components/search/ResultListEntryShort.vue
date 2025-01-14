<template>
  <li>
    <AppLink :to="`${entryData.link}`">
      <section
        class="p-2 hover:bg-gray-300 lg:flex"
        :class="{ 'bg-gray-200': isCurrentEntry,
                  'text-right': langRtoL(entryData.lang[0] as LangCode) }"
        :aria-current="isCurrentEntry"
      >
        <SearchResultLabel
          :predicate="entryData.predicate"
          :label-data="entryData.label"
          :label-lang="entryData.lang"
        />
      </section>
    </AppLink>
  </li>
</template>

<script setup lang="ts">
import { LangCode } from "~/composables/locale";

const route = useRoute();

interface Props {
  entryData: {
    link: string;
    predicate: string;
    label: string;
    lang: string[];
    samling: string;
    translate?: string;
  };
}

const props = defineProps<Props>();

const isCurrentEntry = computed(() => {
  if ("/" + props.entryData.link === route.path) {
    return true;
  } else {
    return false;
  }
});
</script>
