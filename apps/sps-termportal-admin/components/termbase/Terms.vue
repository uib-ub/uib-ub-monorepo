<template>
  <UtilsTableWrapper :heading-level="headingLevel">
    <template #header>
      Termer
    </template>
    <div class="max-w-4xl">
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
        :global-filter-fields="['link', 'prefLabels', 'altLabels', 'hiddenLabels']"
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
          field="prefLabels"
          header="Anbefalt term"
          sortable
        >
          <template #body="slotProps">
            <div
              v-for="(label, index) in slotProps.data.prefLabels"
              :key="index"
              class="mb-1"
            >
              {{ label }}
            </div>
          </template>
        </Column>
        <Column
          field="altLabels"
          header="Tillatt term"
          sortable
        >
          <template #body="slotProps">
            <div
              v-for="(label, index) in slotProps.data.altLabels"
              :key="index"
              class="mb-1"
            >
              {{ label }}
            </div>
          </template>
        </Column>
        <Column
          field="hiddenLabels"
          header="Frarådet term"
          sortable
        >
          <template #body="slotProps">
            <div
              v-for="(label, index) in slotProps.data.hiddenLabels"
              :key="index"
              class="mb-1"
            >
              {{ label }}
            </div>
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

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  published: { value: null, matchMode: FilterMatchMode.EQUALS },
});

const datatable = ref();

const { data } = useLazyFetch(`/api/tb/${props.termbase.id}/terms`, {
  query: { internal: true },
});

const displayData = computed(() => {
  if (data.value) {
    const tmp = data.value.map((concept) => {
      return {
        label: concept.concept.value
          .split("/").slice(-1)[0]
          .replace(`${props.termbase.id}-3A`, ""),
        link: createWikiLink(concept.concept.value),
        published: concept.published.value == "true",
        prefLabels: concept.prefLabels ? concept.prefLabels.value.split("||") : [],
        altLabels: concept.altLabels ? concept.altLabels.value.split("||") : [],
        hiddenLabels: concept.hiddenLabels ? concept.hiddenLabels.value.split("||") : [],
      };
    });
    return tmp;
  }
  else {
    return null;
  }
});

const exportData = () => {
  datatable.value.exportCSV();
};
</script>
