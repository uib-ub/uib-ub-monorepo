<template>
  <div class="flex">
    <SideBar />
    <main class="space-y-4">
      <SimpleOverview v-model:modelValue="selectedTermbase" />
      <ExploreDefinitions
        v-if="selectedTermbase?.id"
        :key="`exploredef${selectedTermbase?.id}`"
        :termbase="selectedTermbase"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
const selectedTermbase = ref<Record<string, string | null>>({});
</script>
