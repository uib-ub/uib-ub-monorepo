<template>
  <UtilsTableWrapper
    heading-level="h3"
    :pending="pending"
  >
    <template #header>
      Domener
    </template>
    <template #description>
      Domener i publiserte termposter.
    </template>
    <div class="max-w-xl">
      <DataTable
        v-if="displayData && displayData.length > 0"
        ref="datatable"
        v-model:filters="filters"
        :value="displayData"
        removable-sort
        sort-field="domain"
        :sort-order="1"
        table-style="min-width: 1rem"
      >
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
          header="Domene"
        >
          <template #body="{ data }">
            {{ data.label }}
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
        <Column
          field="concepts"
          header="Antall"
          sortable
        />
      </DataTable>
      <UtilsTableLegend>
        <UtilsTableLegendEntry
          legend-key="Domene"
          legend-value="En advarsel betyr at mindre enn tre navner er definert."
        />
      </UtilsTableLegend>
    </div>
  </UtilsTableWrapper>
</template>

<script setup lang="ts">
import { FilterMatchMode } from "primevue/api";

const appConfig = useAppConfig();

const datatable = ref();

const props = defineProps({ termbase: { type: Object, required: true } });

const { data: domainData } = await useLazyFetch("/api/domain/all/domain_overview", {
  query: { internal: true },
});
const { data: tbDomainData, pending } = useLazyFetch(`/api/tb/${props.termbase.id}/domains`);

const displayData = computed(() => {
  if (domainData.value && tbDomainData.value) {
    const completeData = processTopdomains(
      appConfig.domains.topdomainOrder,
      cleanDomainData(domainData.value),
    );

    const tbData = tbDomainData.value?.reduce((acc, domain) => {
      acc[domain.id.value] = { count: domain.count.value, parents: domain.parents.value.split(", ") };
      return acc;
    }, {} as Record<string, number>);
    const tbDataDomainIds = Object.keys(tbData)
      .concat(Object.values(tbData)
        .flatMap(domain => domain.parents));

    const merged = completeData.filter(domain =>
      tbDataDomainIds.includes(domain.id),
    ).map((domain) => {
      return {
        id: domain.id,
        label: domain?.nb || domain?.nn || domain?.en,
        published: domain.published,
        labelsLen: domain.labelsLen,
        concepts: Object.keys(tbData).includes(domain.id) ? tbData[domain.id].count : null,
        order: domain.order,
        hierarchy: domain.hierarchy };
    });

    return merged;
  }
  return [];
});

const filters = ref({
  published: { value: null, matchMode: FilterMatchMode.EQUALS },
});
</script>
