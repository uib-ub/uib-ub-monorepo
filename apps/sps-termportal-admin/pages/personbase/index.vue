<template>
  <main class="pt-8">
    <h1 class="mb-6 text-2xl">Personbank</h1>
    <DataTable
      v-model:filters="filters"
      v-model:expandedRows="expandedRows"
      :value="procdata"
      removable-sort
      paginator
      :rows="15"
      class="max-w-7xl"
      filter-display="row"
      :global-filter-fields="['name', 'domain', 'subdomain']"
    >
      <template #header>
        <div class="flex flex-wrap justify-between gap-2">
          <div class="flex">
            <InputText v-model="filters['global'].value" placeholder="Søk" />
          </div>
          <div>
            <Button class="h-10" text label="Expand All" @click="expandAll" />
            <Button
              class="h-10"
              text
              label="Collapse All"
              @click="collapseAll"
            />
          </div>
        </div>
      </template>
      <Column expander style="width: 5rem" />
      <Column field="name" header="Navn" sortable />
      <Column
        field="domain"
        header="Domene"
        sortable
        filter-field="domain"
        :show-filter-menu="false"
      >
        <template #filter="{ filterModel, filterCallback }">
          <MultiSelect
            v-model="filterModel.value"
            :options="domains"
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
      <Column
        field="subdomain"
        header="Subdomene"
        sortable
        filter-field="subdomain"
        :show-filter-menu="false"
      >
        <template #filter="{ filterModel, filterCallback }">
          <MultiSelect
            v-model="filterModel.value"
            :options="subdomains"
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
      <Column
        field="termgroup"
        header="Termgruppe"
        sortable
        data-type="boolean"
      >
        <template #body="{ data }">
          <div class="flex align-items-center gap-2">
            <span>{{ data.termgroup ? "Ja" : "Nei" }}</span>
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
        field="refgroup"
        header="Referansegruppe"
        sortable
        data-type="boolean"
      >
        <template #body="{ data }">
          <div class="flex align-items-center gap-2">
            <span>{{ data.refgroup ? "Ja" : "Nei" }}</span>
          </div>
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <TriStateCheckbox
            v-model="filterModel.value"
            @change="filterCallback()"
          />
        </template>
      </Column>
      <Column field="lastUpdated" header="Sist oppdatert" sortable />
      <Column header="">
        <template #body="slotProps">
          <NuxtLink
            v-if="slotProps.data._id"
            :to="`${studioBaseRoute}/person;${slotProps.data._id}`"
            target="_blank"
            class="hover:bg-gray-100 p-1 rounded"
          >
            Studio
          </NuxtLink>
        </template>
      </Column>

      <!-- Expanded -->
      <template #expansion="slotProps">
        <div class="p-4 space-y-3 max-w-3xl">
          <div v-if="slotProps.data.note" class="content-page">
            <h2 class="text-lg py-1 font-semibold">Merknad</h2>
            <TpSanityContent :blocks="slotProps.data.note" />
          </div>
          <div v-if="slotProps.data.membership">
            <h2 class="text-lg py-1 font-semibold">Grupper</h2>
            <ul class="list-disc ml-5">
              <li
                v-for="membership in slotProps.data.membership"
                :key="membership"
              >
                {{ membership }}
              </li>
            </ul>
          </div>
        </div>
      </template>
    </DataTable>
  </main>
</template>

<script setup lang="ts">
import { FilterMatchMode } from "primevue/api";

const expandedRows = ref([]);
const expandAll = () => {
  expandedRows.value = procdata.value;
};
const collapseAll = () => {
  expandedRows.value = [];
};

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  domain: { value: null, matchMode: FilterMatchMode.IN },
  subdomain: { value: null, matchMode: FilterMatchMode.IN },
  termgroup: { value: null, matchMode: FilterMatchMode.EQUALS },
  refgroup: { value: null, matchMode: FilterMatchMode.EQUALS },
});

const query = `
*[_type == "person" && defined(qualifiedCandidacy)]
 {
  "membership": *[_type == "group" && references(^._id)]{ label },
  ...
  }
`;

const { data } = await useLazySanityQuery(query);

const procdata = computed(() => {
  const tmp = data.value?.map((person) => {
    return person.qualifiedCandidacy.map((cand) => {
      return {
        ...cand,
        _id: person._id,
        name: person?.label,
        note: person?.note,
        membership: person?.membership?.map((membership) => membership.label),
        lastUpdated: person?.lastUpdated,
        domain: domainsUhr[cand?.domain],
      };
    });
  });
  return flattenList(tmp);
});

const domains = computed(() => {
  const domainArray = procdata.value?.map((cand) => {
    return cand.domain;
  });

  return [...new Set(domainArray)].sort().reverse();
});

const subdomains = computed(() => {
  const subdomainArray = procdata.value?.map((cand) => {
    return cand.subdomain;
  });

  return [...new Set(subdomainArray)].sort().reverse();
});
</script>
