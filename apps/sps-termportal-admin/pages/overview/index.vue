<template>
  <div class="flex">
    <SideBar></SideBar>
    <main class="pt-8">
      <h1 class="mb-6 text-2xl">Termbase Overview</h1>
      <DataTable :value="merged" removable-sort table-style="min-width: 1rem">
        <Column field="label" header="Label" />
        <Column field="id" header="ID" />
        <Column field="conceptCount" header="Concepts" />
      </DataTable>
    </main>
  </div>
</template>

<script setup lang="ts">
const { data: dbdata } = await useLazyFetch("/api/overview/fuseki");
const { data: cmsdata } = ""

const merged = computed(() => {
  const dbdatap = dbdata.value?.results?.bindings.map((e) => {
    return {
      label: e.label.value,
      id: e.id.value,
      conceptCount: e.concepts.value,
    };
  });
  return dbdatap;
});
</script>
