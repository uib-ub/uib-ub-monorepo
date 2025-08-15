<template>
  <div class="space-y-2">
    <p>Select domain to display more information.</p>
    <p>
      Use <code class="bg-gray-200">^1</code> to search only for domains that
      start with the number after the <code class="bg-gray-200">^</code>.
    </p>
    <DataTable
      ref="datatable"
      v-model:filters="filters"
      v-model:selection="selectedDomain"
      selection-mode="single"
      :value="displayData"
      removable-sort
      filter-display="row"
      :row-class="rowClass"
      table-style="min-width: 1rem"
      :global-filter-fields="['hierarchy', 'nb']"
      paginator
      :rows="15"
      :rows-per-page-options="[15, 25, 50, 100]"
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
            @click="exportData()"
          />
        </div>
      </template>
      <Column
        selection-mode="single"
        header-style="width: 3rem"
      />
      <Column
        sortable
        field="order"
        header="Kode"
      >
        <template #body="{ data }">
          <div :style="{ 'padding-left': `${(data.level - 1) * 12}px` }">
            <span>{{
              data.hierarchy.substring(1, data.hierarchy.length - 1)
            }}</span>
          </div>
        </template>
      </Column>
      <Column
        sortable
        field="nb"
        header="Bokmål navn"
      />
      <Column
        sortable
        field="labelsLen"
        header="Navner"
      >
        <template #body="{ data }">
          <Icon
            v-if="data?.labelsLen < 3"
            name="fa6-solid:triangle-exclamation"
            size="1.2em"
            class="ml-[6px] mt-[3px]"
            :class="
              data.published
                ? appConfig.ui.color.status.error.class
                : appConfig.ui.color.status.warning.class
            "
          />
          <div class="" />
        </template>
      </Column>
      <Column
        sortable
        field="concepts"
        header="Begreper"
      />
      <Column
        sortable
        field="conceptSum"
        header="Totalt antall begreper"
      />
      <Column
        field="published"
        header="publisert"
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
      <Column header="">
        <template #body="slotProps">
          <NuxtLink
            :to="`${wikiPageLink}DOMENE:${slotProps.data.id}`"
            target="_blank"
          >
            Wiki
          </NuxtLink>
        </template>
      </Column>
    </DataTable>
    <UtilsTableLegend>
      <UtilsTableLegendEntry
        legend-key="Navner"
        legend-value="En advarsel betyr at mindre enn tre navner er definert."
      />
      <UtilsTableLegendEntry
        legend-key="Begreper"
        legend-value="Begreper som er direkte definert i domenet"
      />
      <UtilsTableLegendEntry
        legend-key="Totalt antall Begreper"
        legend-value="Begreper som er direkte definert i domenet eller i underdomener"
      />
    </UtilsTableLegend>
    <section v-if="selectedDomain">
      <h3 class="text-2xl">
        Domain info
      </h3>
      <dl>
        <div
          v-for="lc in ['nb', 'nn', 'en']"
          :key="lc"
          class="flex"
        >
          <dt class="w-8">
            {{ lc }}:
          </dt>
          <dd>{{ selectedDomain?.[lc] }}</dd>
        </div>
      </dl>
    </section>
  </div>
</template>

<script setup lang="ts">
import { FilterMatchMode } from "primevue/api";

const appConfig = useAppConfig();

const datatable = ref();
const exportData = () => {
  datatable.value.exportCSV();
};

const selectedDomain = ref();
defineProps({
  modelValue: { type: Object, required: true },
});
const emits = defineEmits(["update:modelValue"]);

watch(selectedDomain, () => {
  emits("update:modelValue", selectedDomain.value);
});

const { data } = await useLazyFetch("/api/domain/all/domain_overview", {
  query: { internal: true },
});

const displayData = computed(() => {
  if (data.value) {
    return processTopdomains(appConfig.domains.topdomainOrder, cleanDomainData(data.value));
  }
  return [];
});

const rowClass = (data) => {
  return [{ "bg-gray-100": data.level === "1" }];
};

const filters = ref({
  global: { value: "^", matchMode: FilterMatchMode.CONTAINS },
  published: { value: null, matchMode: FilterMatchMode.EQUALS },
});
</script>
