<template>
  <div class="flex">
    <SideBar></SideBar>
    <main class="pt-8">
      <section>
        <h1 class="mb-6 text-2xl">Termbase Overview</h1>
        <DataTable
          v-model:filters="filters"
          v-model:selection="selectedTermbase"
          selection-mode="multiple"
          :value="merged"
          removable-sort
          paginator
          :rows="15"
          filter-display="row"
          table-style="min-width: 1rem"
          :global-filter-fields="['label', 'id', 'conceptCount']"
        >
          <template #header>
            <div class="flex">
              <InputText
                v-model="filters['global'].value"
                placeholder="Keyword Search"
              />
            </div>
          </template>
          <Column selection-mode="multiple" header-style="width: 3rem"></Column>
          <Column sortable field="label" header="Label" />
          <Column sortable field="id" header="ID" />
          <Column sortable field="conceptCount" header="Concepts" />
          <Column
            sortable
            header="Status"
            field="status"
            filter-field="status"
            :show-filter-menu="false"
          >
            <template #body="{ data }">
              <div class="flex align-items-center gap-2">
                <span>{{ data.status }}</span>
              </div>
            </template>
            <template #filter="{ filterModel, filterCallback }">
              <MultiSelect
                v-model="filterModel.value"
                :options="statuses"
                option-label="name"
                placeholder="Any"
                class="p-column-filter"
                style="min-width: 10rem"
                :max-selected-labels="0"
                @change="filterCallback()"
              >
                <template #option="slotProps">
                  <div class="flex align-items-center gap-2">
                    <span>{{ slotProps.option }}</span>
                  </div>
                </template>
              </MultiSelect>
            </template>
          </Column>
          <Column sortable field="labels" header="Labels" data-type="boolean">
            <template #body="{ data }">
              <div class="flex align-items-center gap-2">
                <span>{{ data.labels ? "Ja" : "Nei" }}</span>
              </div>
            </template>
            <template #filter="{ filterModel, filterCallback }">
              <TriStateCheckbox
                v-model="filterModel.value"
                @change="filterCallback()"
              />
            </template>
          </Column>
          <Column
            sortable
            field="descriptions"
            header="Descriptions"
            data-type="boolean"
          >
            <template #body="{ data }">
              <div class="flex align-items-center gap-2">
                <span>{{ data.descriptions ? "Ja" : "Nei" }}</span>
              </div>
            </template>
            <template #filter="{ filterModel, filterCallback }">
              <TriStateCheckbox
                v-model="filterModel.value"
                @change="filterCallback()"
              />
            </template>
          </Column>
          <Column
            sortable
            field="agreement"
            header="Agreement"
            data-type="boolean"
          >
            <template #body="{ data }">
              <div class="flex align-items-center gap-2">
                <span>{{ data.agreement ? "Ja" : "Nei" }}</span>
              </div>
            </template>
            <template #filter="{ filterModel, filterCallback }">
              <TriStateCheckbox
                v-model="filterModel.value"
                @change="filterCallback()"
              />
            </template>
          </Column>
          <Column header="">
            <template #body="slotProps">
              <NuxtLink
                v-if="
                  ['4. opprettet', '5. publisert'].includes(
                    slotProps.data.status
                  )
                "
                :to="`https://wiki.terminologi.no/index.php?title=${slotProps.data.id.replace(
                  '*',
                  ''
                )}:${slotProps.data.id.replace('*', '')}`"
                target="_blank"
              >
                Wiki
              </NuxtLink>
            </template>
          </Column>
          <Column header="">
            <template #body="slotProps">
              <NuxtLink
                v-if="slotProps.data._id"
                :to="`/studio/desk/termbase;${slotProps.data._id}`"
                target="_blank"
              >
                Studio
              </NuxtLink>
            </template>
          </Column>
        </DataTable>
      </section>
      <TermgroupMembers
        v-if="selectedTermbase.length > 0"
        :key="'members' + selectedTermbase.map((tb) => tb._id).join('')"
        :termbases="selectedTermbase.map((tb) => tb._id)"
      />
      <TermbaseActivities
        v-if="selectedTermbase.length > 0"
        :key="'activities' + selectedTermbase.map((tb) => tb._id).join('')"
        :termbases="
          Object.fromEntries(selectedTermbase.map((d) => [d._id, d.label]))
        "
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
  const enriched = dbdata.value?.results?.bindings
    .map((e) => ({
      label: e.label.value,
      id: e.id.value,
      conceptCount: e.concepts.value,
      status: numberStatus(matchid(cmsdata, e, "status")),
      labels: matchid(cmsdata, e, "labelsOk"),
      descriptions: matchid(cmsdata, e, "descriptionsOk"),
      agreement: matchid(cmsdata, e, "hasLicenseAgreement"),
      _id: matchid(cmsdata, e, "_id"),
    }))
    .filter((termbase) => termbase.id !== "DOMENE");

  if (enriched) {
    const ids = dbdata.value?.results?.bindings.map((e) => e.id.value);
    for (const entry of cmsdata.value) {
      if (!ids.includes(entry.id)) {
        const data = {
          label: entry.label,
          id: entry.id + "*",
          status: numberStatus(entry.status),
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

const statuses = computed(() => {
  const statusArray = merged.value?.map((tb) => {
    return tb.status;
  });

  return [...new Set(statusArray)].sort().reverse();
});

const selectedTermbase = ref([]);
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  agreement: { value: null, matchMode: FilterMatchMode.EQUALS },
  descriptions: { value: null, matchMode: FilterMatchMode.EQUALS },
  labels: { value: null, matchMode: FilterMatchMode.EQUALS },
  status: { value: null, matchMode: FilterMatchMode.IN },
});
</script>
