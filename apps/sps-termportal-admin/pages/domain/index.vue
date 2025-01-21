<template>
    <div class="flex">
      <!-- <SideBar /> -->
      <main class="space-y-8 pt-8">
        <section>
          <h1 class="mb-6 text-2xl">Domener</h1>
          <SimpleDomainOverview v-model:modelValue="selectedDomain" />
        </section>
        <DomainTermbases
          v-if="selectedDomain?.id"
          :key="`exploredomaintb${selectedDomain?.id}`"
          :domain="selectedDomain"
        />
      </main>
    </div>
  </template>
  
  <script setup lang="ts">
  const selectedDomain = ref<Record<string, string | null>>({});
  </script>
  