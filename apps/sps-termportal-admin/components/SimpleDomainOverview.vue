<template>
  <div class="">
    <DataTable
      v-model:filters="filters"
      selection-mode="single"
      :value="displayData"
      removable-sort
      filter-display="row"
      table-style="min-width: 1rem"
      :global-filter-fields="['hierarchy', 'nb', 'nn', 'en']"
    >
      <template #header>
        <div class="flex space-x-3">
          <InputText v-model="filters['global'].value" placeholder="Søk" />
        </div>
      </template>
      <Column sortable field="order" header="Kode">
        <template #body="{ data }">
          <div :style="{ 'padding-left': `${(data.level - 1) * 12}px` }">
            <span>{{ data.hierarchy.substring(1, data.hierarchy.length-1) }}</span>
          </div>
        </template>
      </Column>
      <Column sortable field="nb" header="Bokmål" />
      <Column sortable field="nb" header="Nynorsk" />
      <Column sortable field="nb" header="Engelsk" />
    </DataTable>
    <pre>{{ displayData }}</pre>
  </div>
</template>

<script setup lang="ts">
import { FilterMatchMode } from "primevue/api";

import { prefix } from "termportal-ui/utils/utils";

const query = `${prefix}
SELECT
  ?concept
  (CONCAT("{",GROUP_CONCAT(?lab; SEPARATOR=", "), "}") AS ?labels)
  ?level
  ?children
WHERE {
  GRAPH ns:DOMENE {
    ?concept skosxl:prefLabel ?label .
    ?label skosxl:literalForm ?labelVal .
    BIND(
      CONCAT("\\"", lang(?labelVal), "\\"", ": \\"", STR(?labelVal), "\\"") AS ?lab
    )
    {
      SELECT
        ?concept
        (COUNT(DISTINCT ?parents) AS ?level)
        (GROUP_CONCAT(DISTINCT ?child; SEPARATOR=", ") AS ?children)
      WHERE {
        ?concept rdf:type skos:Concept ;
                 skos:broader* ?parents .
        OPTIONAL {
          ?concept skos:narrower ?child .
        }
      }
      GROUP BY ?concept
    }
  }
}
GROUP BY ?concept ?level ?children
`;

// const { data } = await useLazyFetch("/api/tb/all/overview");
const { data } = await useLazyFetch("/api/query", {
  method: "post",
  body: { query },
});

const preProc = computed(() => {
  return data.value?.map((d) => {
    const labels = JSON.parse(d.labels.value);

    return {
      concept: d.concept.value,
      nb: labels?.nb,
      nn: labels?.nn,
      en: labels?.en,
      level: d.level.value,
      children: d?.children ? d?.children.value.split(", ") : [],
    };
  });
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
    domainInstance.children.forEach((child) => {
      hierarchyCounter++;
      const childDomain = data.filter((d) => d.concept === child)[0];
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
  if (preProc.value) {
    const collected = [];
    let domainCounter = 0;
    const topdomains = preProc.value.filter((d) => d.level === "1").sort();
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
    return collected;
  }
});

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
</script>
