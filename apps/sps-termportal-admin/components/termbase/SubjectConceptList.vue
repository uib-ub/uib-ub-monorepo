<template>
  <UtilsTableWrapper :heading-level="headingLevel">
    <template #header>
      Bruksområder i termpost
    </template>
    <div
      class="max-w-4xl"
    >
      <DataTable
        v-if="data && data.length > 0"
        ref="datatable"
        v-model:filters="filters"
        :value="displayData"
        paginator
        :rows="15"
        removable-sort
        sort-field="link"
        :sort-order="1"
        table-style="min-width: 1rem"
        filter-display="row"
        :global-filter-fields="['link', 'subjects']"
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
          field="link"
          header="Termpost"
          sortable
        >
          <template #body="slotProps">
            <AppLink :to="slotProps.data.link">
              {{
                slotProps.data.label
              }}
            </AppLink>
          </template>
        </Column>
        <Column
          field="published"
          header="Publisert"
          sortable
          data-type="boolean"
        >
          <template #body="{ data }">
            <div class="flex align-items-center gap-2">
              <span>{{ data.published ? "Ja" : "Nei" }}</span>
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
          field="subjects"
          header="Bruksområde"
          filter-field="subjects"
          :show-filter-menu="false"
          sortable
        >
          <template #body="slotProps">
            {{ slotProps.data.subjects.join(", ") }}
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <MultiSelect
              v-model="filterModel.value"
              :options="subjectValues"
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
      </DataTable>
    </div>
  </UtilsTableWrapper>
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
  published: { value: null, matchMode: FilterMatchMode.EQUALS },
  subjects: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

type ConceptListData = Array<{
  concept: SparqlBindingKey;
  subjects: SparqlBindingKey;
  published: SparqlBindingKeyDt; }>;

const { data } = useLazyFetch<ConceptListData>(`/api/tb/${props.termbase.id}/subjectsTermposts`, {
  query: { internal: true },
});

const displayData = computed(() => {
  const tmp = data.value?.map((concept) => {
    return {
      label: concept.concept.value
        .split("/").slice(-1)[0]
        .replace(`${props.termbase.id}-3A`, ""),
      link: createWikiLink(concept.concept.value),
      published: concept.published.value == "true",
      subjects: concept.subjects ? concept.subjects.value.split("||") : [],

    };
  });

  return tmp;
});

const subjectValues = computed (() => {
  const subjectArray = displayData.value?.map((entry) => {
    return entry.subjects;
  }).flat();
  return [...new Set(subjectArray)].sort().reverse();
});

const exportData = () => {
  datatable.value.exportCSV();
};
</script>
