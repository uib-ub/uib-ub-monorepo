<template>
  <DataTable
    v-model:filters="filters"
    v-model:selection="selectedTermbase"
    selection-mode="single"
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
        <InputText v-model="filters['global'].value" placeholder="Søk" />
      </div>
    </template>
    <Column selection-mode="single" header-style="width: 3rem"></Column>
    <Column sortable field="label" header="Navn" />
    <!-- <Column sortable field="id" header="ID" /> -->
    <Column sortable field="conceptCount" header="Begreper" />
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
          placeholder="Alle"
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
    <Column sortable field="staff" header="Ansatt" :show-filter-menu="false">
      <template #body="{ data }">
        <div class="flex align-items-center gap-2">
          <span>{{ data.staff }}</span>
        </div>
      </template>
      <template #filter="{ filterModel, filterCallback }">
        <MultiSelect
          v-model="filterModel.value"
          :options="staffMembers"
          option-label="name"
          placeholder="Alle"
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
    <Column header="">
      <template #body="slotProps">
        <NuxtLink
          v-if="
            ['4. opprettet', '5. publisert'].includes(slotProps.data.status)
          "
          :to="`${wikiPageLink}${slotProps.data.id.replace(
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
          :to="`${studioBaseRoute}/termbase;${slotProps.data._id}`"
          target="_blank"
        >
          Studio
        </NuxtLink>
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang="ts">
import { FilterMatchMode } from "primevue/api";

const selectedTermbase = ref();
const props = defineProps({
  modelValue: { type: Object, required: true },
});
const emits = defineEmits(["update:modelValue"]);

watch(selectedTermbase, () => {
  emits("update:modelValue", selectedTermbase.value);
});

const { data: dbdata } = await useLazyFetch("/api/tb/all/overview", {
  query: { internal: true },
});

const query = `
*[_type == "termbase" &&
 (status == 'publisert' || status == 'opprettet')
]{
  _id,
  id,
  label,
  status,
  "responsibleStaff": responsibleStaff->label
}`;

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
      staff: matchid(cmsdata, e, "responsibleStaff"),
      _id: matchid(cmsdata, e, "_id"),
    }))
    .filter((termbase) => termbase.id !== "DOMENE");

  if (enriched && cmsdata.value) {
    const ids = dbdata.value?.results?.bindings.map((e) => e.id.value);
    for (const entry of cmsdata.value) {
      if (!ids.includes(entry.id)) {
        const data = {
          label: entry.label,
          id: entry.id,
          conceptCount: 0,
          status: numberStatus(entry.status),
          staff: entry.responsibleStaff,
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

const staffMembers = computed(() => {
  const staffArray = merged.value?.map((tb) => {
    return tb.staff;
  });

  return [...new Set(staffArray)].sort().reverse();
});

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  status: { value: null, matchMode: FilterMatchMode.IN },
  staff: { value: null, matchMode: FilterMatchMode.IN },
});
</script>
