<template>
  <div class="flex">
    <!-- <SideBar /> -->
    <main class="space-y-6 py-8">
      <div class="space-y-12">
        <section>
          <h1 class="mb-6 text-2xl">Termbase Quality</h1>
          <SimpleOverview v-model:modelValue="selectedTermbase" />
        </section>
        <QualitySemanticRelations
          v-if="selectedTermbase?.id"
          :key="`qualityrelations${selectedTermbase?.id}`"
          :termbase="selectedTermbase"
        />
        <QualityMissingDefinitions
          v-if="selectedTermbase?.id"
          :key="`qualityMissingDefs${selectedTermbase?.id}`"
          :termbase="selectedTermbase"
        />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const selectedTermbase = ref<Record<string, string | null>>({});
</script>
