<template>
  <div class="flex">
    <SideBar />
    <main class="space-y-4 pt-8">
      <section>
        <h1 class="mb-6 text-2xl">Domain Exploration</h1>
        <SimpleDomainOverview v-model:modelValue="selectedDomain" />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
const selectedDomain = ref<Record<string, string | null>>({});
</script>
