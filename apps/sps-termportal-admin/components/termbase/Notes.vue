<template>
  <UtilsTableWrapper
    :heading-level="headingLevel"
    :pending="pending"
  >
    <template #header>
      Merknader
    </template>
    <div class="max-3xl">
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
        :global-filter-fields="['link', 'note']"
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
          <template #filter="{ filterModel, filterCallback }">
            <TriStateCheckbox
              v-model="filterModel.value"
              @change="filterCallback()"
            />
          </template>
          <template #body="{ data }">
            <div class="flex align-items-center gap-2">
              <span>{{ data.published ? "Ja" : "Nei" }}</span>
            </div>
          </template>
        </Column>

        <Column
          field="noteType"
          header="Merknadstype"
          filter-field="noteType"
          :show-filter-menu="false"
          sortable
        >
          <template #filter="{ filterModel, filterCallback }">
            <MultiSelect
              v-model="filterModel.value"
              :options="noteTypeValues"
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
          field="note"
          header="Merknad"
        />
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
  noteType: { value: null, matchMode: FilterMatchMode.EQUALS },
});

const { data, pending } = useLazyFetch(`/api/tb/${props.termbase.id}/notes`, {
  query: { internal: true },
});

const displayData = computed(() => {
  if (data.value) {
    const tmp = data.value.map((note) => {
      return {
        label: note.concept.value
          .split("/").slice(-1)[0]
          .replace(`${props.termbase.id}-3A`, ""),
        link: createWikiLink(note.concept.value),
        published: note.published ? note.published.value == "true" : true,
        noteType: note.noteType.value,
        note: note.note.value,
      };
    });
    return tmp;
  }
  else {
    return null;
  }
});

const noteTypeValues = computed (() => {
  const valueArray = displayData.value?.map((entry) => {
    return entry.noteType;
  }).flat();
  return [...new Set(valueArray)].sort().reverse();
});

const exportData = () => {
  datatable.value.exportCSV();
};
</script>
