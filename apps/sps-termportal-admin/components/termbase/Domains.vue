<template>
  <UtilsTableWrapper
    heading-level="h3"
    :pending="pending"
  >
    <template #header>
      Domener
    </template>
    <template #description>
      Domener i termposter.
    </template>
    <div class="max-w-2xl">
      <DataTable
        v-if="displayData && displayData.length > 0"
        ref="datatable"
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
              class="ml-1.5 mt-0.75"
              :class="
                data.domainPublished
                  ? appConfig.ui.color.status.error.class
                  : appConfig.ui.color.status.warning.class
              "
            />
            <div class="" />
          </template>
        </Column>
        <Column
          field="domainPublished"
          header="Domene publisert"
          data-type="boolean"
        >
          <template #body="{ data }">
            <div class="flex align-items-center gap-2">
              <span>{{ data.domainPublished ? "Ja" : "Nei" }}</span>
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
          field="conceptsPublishedCount"
          header="Termposter publisert"
          sortable
        />
        <Column
          field="conceptsUnpublishedCount"
          header="Termposter upublisert"
          sortable
        />
      </DataTable>
      <UtilsTableLegend>
        <UtilsTableLegendEntry
          legend-key="Domene"
          legend-value="En advarsel betyr at mindre enn tre navn er definert."
        />
        <UtilsTableLegendEntry
          legend-key="Termposter"
          legend-value="Statusen viser publiseringsinnstillingen for hver termpost. Hvis termbasen ikke er publisert, vil ingen av termpostene være offentlig tilgjengelige, uavhengig av individuelle innstillinger."
        />
      </UtilsTableLegend>
    </div>
  </UtilsTableWrapper>
</template>

<script setup lang="ts">
const appConfig = useAppConfig();

const datatable = ref();

const props = defineProps({ termbase: { type: Object, required: true } });

const { data: domainData } = useLazyFetch("/api/domain/all/domain_overview", {
  query: { internal: true },
});
const { data: tbDomainData, pending } = useLazyFetch(`/api/tb/${props.termbase.id}/domains`, {
  query: { internal: true },
});

const displayData = computed(() => {
  if (domainData.value && tbDomainData.value) {
    const completeData = processTopdomains(
      appConfig.domains.topdomainOrder,
      cleanDomainData(domainData.value),
    );

    const tbData = tbDomainData.value?.reduce((acc, domain) => {
      const id = typeof domain.id === "string" ? domain.id : domain.id.value;
      const count = typeof domain.count === "number" ? domain.count : parseInt(domain.count.value);
      const publishedCount = typeof domain.publishedCount === "number" ? domain.publishedCount : parseInt(domain.publishedCount.value);
      const parentsStr = typeof domain.parents === "string" ? domain.parents : domain.parents.value;
      acc[id] = { count, publishedCount, parents: parentsStr ? parentsStr.split(", ") : [] };
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
        domainPublished: domain.published,
        labelsLen: domain.labelsLen,
        conceptsPublishedCount: Object.keys(tbData).includes(domain.id) ? tbData[domain.id].publishedCount : null,
        conceptsUnpublishedCount: Object.keys(tbData).includes(domain.id) ? tbData[domain.id].count - tbData[domain.id].publishedCount : null,
        order: domain.order,
        hierarchy: domain.hierarchy };
    });

    const noDomainKey = appConfig.domains.noDomainKey;
    if (tbDataDomainIds.includes(noDomainKey)) {
      merged.push({
        id: "",
        label: noDomainKey,
        domainPublished: false,
        labelsLen: 3,
        conceptsPublishedCount: tbData[noDomainKey].publishedCount,
        conceptsUnpublishedCount: tbData[noDomainKey].count - tbData[noDomainKey].publishedCount,
        order: 0,
        hierarchy: "^0$",

      });
    }

    return merged;
  }
  return [];
});
</script>
