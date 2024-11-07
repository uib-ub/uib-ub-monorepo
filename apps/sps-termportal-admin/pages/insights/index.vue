<template>
  <div class="flex">
    <!-- <SideBar></SideBar> -->
    <main class="space-y-8 py-8">
      <h1 class="text-2xl">Insights</h1>
      <InsightsInstitutionsTbs />
      <InsightsInstitutions />
      <InsightsPeople />
      <InsightsReferenceGroup />
      <InsightsReferencePeople />
      <InsightsTopdomainLangCoverage />
      <InsightsDomainLangCoverage />
      <InsightsTermbaseLangCoverage />
      <InsightsPublishedTbsYear />
      <InsightsPlannedTbs />
      <InsightsBasicAnalytics />
      <InsightsAnalyticsTermbaseVisits />
    </main>
  </div>
</template>

<script setup lang="ts">
const { data } = await useLazyFetch("/api/overview/fuseki");

const termbases = computed(() => {
  return data.value?.results?.bindings.map((e) => {
    return {
      label: e.label.value,
      id: e.id.value,
      conceptCount: e.concepts.value,
    };
  });
});
const columns = [
  { field: "label", header: "Label" },
  { field: "id", header: "ID" },
  { field: "conceptCount", header: "Concepts" },
];

const selectedTermbase = ref();
</script>
