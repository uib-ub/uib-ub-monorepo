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
      :rowsPerPageOptions="[15, 25, 50, 100]"
    >
      <template #header>
        <div class="flex justify-between">
          <InputText v-model="filters['global'].value" placeholder="Søk" />
          <Button class="h-10" label="Eksport" @click="exportData()" />
        </div>
      </template>
      <Column selection-mode="single" header-style="width: 3rem"></Column>
      <Column sortable field="order" header="Kode">
        <template #body="{ data }">
          <div :style="{ 'padding-left': `${(data.level - 1) * 12}px` }">
            <span>{{
              data.hierarchy.substring(1, data.hierarchy.length - 1)
            }}</span>
          </div>
        </template>
      </Column>
      <Column sortable field="nb" header="Bokmål navn" />
      <Column sortable field="labelsLen" header="Navner">
        <template #body="{ data }">
          <Icon
            v-if="data?.labelsLen < 3"
            name="fa6-solid:triangle-exclamation"
            size="1.2em"
            class="ml-[6px] mt-[3px]"
            :class="
              data.published
                ? colorMappingStatus.error.color
                : colorMappingStatus.warning.color
            "
          />
          <div class=""></div>
        </template>
      </Column>
      <Column sortable field="concepts" header="Begreper" />
      <Column sortable field="conceptSum" header="Totalt antall begreper" />
      <Column field="published" header="publisert" data-type="boolean">
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
    <h3 class="text-2xl">Domain info</h3>
    <dl>
      <div v-for="lc in ['nb', 'nn', 'en']" :key="lc" class="flex">
        <dt class="w-8">{{ lc }}:</dt>
        <dd>{{ selectedDomain?.[lc] }}</dd>
      </div>
    </dl>
  </div>
</template>

<script setup lang="ts">
import { FilterMatchMode } from "primevue/api";
import { orderTopDomain } from "~/utils/constants";

const datatable = ref();
const exportData = () => {
  datatable.value.exportCSV();
};

const selectedDomain = ref();
const props = defineProps({
  modelValue: { type: Object, required: true },
});
const emits = defineEmits(["update:modelValue"]);

watch(selectedDomain, () => {
  emits("update:modelValue", selectedDomain.value);
});

const { data } = await useLazyFetch("/api/domain/all/domain_overview", {
  query: { internal: true },
});

const preProc = computed(() => {
  if (data.value) {
    return data.value.map((d) => {
      const labels = JSON.parse(d.labels.value);

      return {
        id: cleanId(d.concept.value, true),
        nb: labels?.nb,
        labelsLen: Object.keys(labels).length,
        nn: labels?.nn,
        en: labels?.en,
        published: d.published.value === "true",
        level: d.level.value,
        children: d?.children
          ? d?.children.value.split(", ").map((id) => cleanId(id, true))
          : [],
        concepts: d.concepts.value,
      };
    });
  }
});

function processDomain(
  data: [],
  output: [Record<string, string | number | Array<number>>],
  domainInstance: {},
  orderCounter: number,
  hierarchy: Array<number>
) {
  let updatedCounter = orderCounter + 1;
  let hierarchyCounter = 0;
  output.push({
    ...domainInstance,
    order: updatedCounter,
    hierarchy: "^" + hierarchy.join(".") + "$",
  });

  if (domainInstance.children) {
    const sortedChildren = domainInstance?.children.sort();
    sortedChildren.forEach((child) => {
      hierarchyCounter++;
      const childDomain = data.filter((d) => d.id === child)[0];
      if (childDomain) {
        updatedCounter = processDomain(
          data,
          output,
          childDomain,
          updatedCounter,
          [...hierarchy, ...[hierarchyCounter]]
        );
      }
    });
  }

  return updatedCounter;
}

const displayData = computed(() => {
  const order = orderTopDomain;
  if (preProc.value) {
    const collected = [];
    let domainCounter = 0;
    const topdomains = preProc.value
      .filter((d) => d.level === "1")
      .sort(
        (a, b) =>
          (order.includes(a.id) ? order.indexOf(a.id) : Infinity) -
          (order.includes(b.id) ? order.indexOf(b.id) : Infinity)
      );
    let hierarchyCounter = 0;
    topdomains.forEach((domain) => {
      hierarchyCounter++;
      domainCounter = processDomain(
        preProc.value,
        collected,
        domain,
        domainCounter,
        [hierarchyCounter]
      );
    });
    const sumAdded = collected.map((outer) => {
      const conceptSum = collected
        .map((inner) =>
          inner.hierarchy.startsWith(outer.hierarchy.slice(0, -1))
            ? parseInt(inner.concepts)
            : 0
        )
        .reduce((a, b) => a + b, 0);
      return { ...outer, ...{ conceptSum } };
    });
    return sumAdded;
  }
});

const rowClass = (data) => {
  return [{ "bg-gray-100": data.level === "1" }];
};

const filters = ref({
  global: { value: "^", matchMode: FilterMatchMode.CONTAINS },
  published: { value: null, matchMode: FilterMatchMode.EQUALS },
});
</script>
