<template>
  <div class="flex">
    <SideBar></SideBar>
    <main class="pt-8">
      <section>
        <h1 class="mb-6 text-2xl">Termbase Overview</h1>
        <DataTable
          v-model:filters="filters"
          v-model:selection="selectedTermbase"
          selection-mode="single"
          :value="merged"
          removable-sort
          table-style="min-width: 1rem"
          :global-filter-fields="['label', 'id', 'conceptCount', 'status']"
        >
          <template #header>
            <div class="flex">
              <InputText
                v-model="filters['global'].value"
                placeholder="Keyword Search"
              />
            </div>
          </template>
          <Column sortable field="label" header="Label" />
          <Column sortable field="id" header="ID" />
          <Column sortable field="conceptCount" header="Concepts" />
          <Column sortable field="status" header="Status" />
          <Column sortable field="labels" header="Labels" />
          <Column sortable field="descriptions" header="Descriptions" />
          <Column sortable field="agreement" header="Agreement" />
          <Column header="">
            <template #body="slotProps">
              <NuxtLink
                v-if="slotProps.data._id"
                :to="`/studio/desk/termbase;${slotProps.data._id}`"
                target="_blank"
              >
                Rediger
              </NuxtLink>
            </template>
          </Column>
        </DataTable>
      </section>
      <TermgroupMembers
        v-if="selectedTermbase?.id"
        :key="selectedTermbase?.id"
        :termbase="selectedTermbase?.id"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { FilterMatchMode } from "primevue/api";

const { data: dbdata } = await useLazyFetch("/api/tb/all/overview");

const query = `*[_type == "termbase"]`;
const { data: cmsdata } = useLazySanityQuery(query);

function matchid(data, entry, key) {
  return data.value?.find((d) => d.id === entry.id.value)?.[key];
}

const merged = computed(() => {
  const enriched = dbdata.value?.results?.bindings.map((e) => ({
    label: e.label.value,
    id: e.id.value,
    conceptCount: e.concepts.value,
    status: matchid(cmsdata, e, "status"),
    labels: matchid(cmsdata, e, "labelsOk"),
    descriptions: matchid(cmsdata, e, "descriptionsOk"),
    agreement: matchid(cmsdata, e, "hasLicenseAgreement"),
    _id: matchid(cmsdata, e, "_id"),
  }));

  if (enriched) {
    const ids = dbdata.value?.results?.bindings.map((e) => e.id.value);
    for (const entry of cmsdata.value) {
      if (!ids.includes(entry.id)) {
        const data = {
          label: entry.label,
          id: entry.id + "*",
          status: entry.status,
          labels: entry.labelsOk,
          descriptions: entry.descriptionsOk,
          agreement: entry.hasLicenseAgreement,
          _id: entry._id,
        };
        enriched.push(data);
      }
    }
  }

  return enriched;
});

const selectedTermbase = ref();
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
</script>
