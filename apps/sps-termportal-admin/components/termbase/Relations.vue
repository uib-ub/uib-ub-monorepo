<template>
  <UtilsTableWrapper :heading-level="headingLevel">
    <template #header>
      Relasjoner
    </template>
    <div class="">
      <DataTable
        v-if="data && data.length > 0"
        ref="datatable"
        v-model:filters="filters"
        :value="displayData"
        paginator
        :rows="10"
        removable-sort
        sort-field="link"
        :sort-order="1"
        table-style="min-width: 1rem"
        filter-display="row"
        :global-filter-fields="['link1', 'link2']"
      >
        <template #header>
          <div class="flex justify-between">
            <InputText
              v-model="filters['global'].value"
              placeholder="Søk"
            />
            <Button
              class="h-10"
              label="Eksport"
              @click="exportData($event)"
            />
          </div>
        </template>
        <Column
          field="link1"
          header="Termpost 1"
          sortable
        >
          <template #body="slotProps">
            <AppLink :to="slotProps.data.link1">
              {{
                slotProps.data.label1
              }}
            </AppLink>
          </template>
        </Column>
        <Column
          field="published1"
          header="Publisert 1"
          sortable
          data-type="boolean"
        >
          <template #body="{ data }">
            <div class="flex align-items-center gap-2">
              <span>{{ data.published1 ? "Ja" : "Nei" }}</span>
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
          field="relation"
          header="Relasjon"
          sortable
          filter-field="relation"
          :show-filter-menu="false"
        >
          <template #filter="{ filterModel, filterCallback }">
            <MultiSelect
              v-model="filterModel.value"
              :options="relationTypes"
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
          field="link2"
          header="Termpost 2"
          sortable
        >
          <template #body="slotProps">
            <AppLink :to="slotProps.data.link2">
              {{
                slotProps.data.label2
              }}
            </AppLink>
          </template>
        </Column>
        <Column
          field="published2"
          header="Publisert 2"
          sortable
          data-type="boolean"
        >
          <template #body="{ data }">
            <div class="flex align-items-center gap-2">
              <span>{{ data.published2 ? "Ja" : "Nei" }}</span>
            </div>
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <TriStateCheckbox
              v-model="filterModel.value"
              @change="filterCallback()"
            />
          </template>
        </Column>
      </DataTable>
    </div>
  </UtilsTableWrapper>
  <pre>{{ data }}</pre>
  <pre>{{ displayData }}</pre>
</template>

<script setup lang="ts">
import { FilterMatchMode } from "primevue/api";

const props = defineProps<{
  termbase: object;
  headingLevel: HeadingLevelWithDefaultOptions;
}>();

const datatable = ref();

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  published1: { value: null, matchMode: FilterMatchMode.EQUALS },
  published2: { value: null, matchMode: FilterMatchMode.EQUALS },
  relation: { value: null, matchMode: FilterMatchMode.EQUALS },
});

const { data } = useLazyFetch(`/api/tb/${props.termbase.id}/relations`, {
  query: { internal: true },
});

const displayData = computed(() => {
  if (data.value) {
    const tmp = data.value.map((pair) => {
      return {
        label1: pair.concept1.value
          .split("/").slice(-1)[0]
          .replace(`${props.termbase.id}-3A`, ""),
        link1: createWikiLink(pair.concept1.value),
        published1: pair.published1.value == "true",
        relation: pair.p.value.split("/").slice(-1)[0],
        label2: pair.concept2.value
          .split("/").slice(-1)[0]
          .replace(`${props.termbase.id}-3A`, ""),
        link2: createWikiLink(pair.concept2.value),
        published2: pair.published2.value == "true",
      };
    });
    return tmp;
  }
  else {
    return null;
  }
});

const relationTypes = computed (() => {
  const relationArray = displayData.value?.map((entry) => {
    return entry.relation;
  });
  return [...new Set(relationArray)].sort().reverse();
});

const exportData = () => {
  datatable.value.exportCSV();
};
</script>
