<template>
  <div class="flex">
    <!-- <SideBar /> -->
    <main class="space-y-4 mt-8">
      <section>
        <h1 class="mb-6 text-2xl">Termbase Quality</h1>
        <SimpleOverview v-model:modelValue="selectedTermbase" />
      </section>
      <qualitySemanticRelations
        v-if="selectedTermbase?.id"
        :key="`qualityrelations${selectedTermbase?.id}`"
        :termbase="selectedTermbase"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
const selectedTermbase = ref<Record<string, string | null>>({});
</script>
