<template>
  <section class="space-y-3">
    <h2 class="text-2xl">Termbases in domain: {{ domain.nb }}</h2>
    <div class="space-y-4">
      <div>
        <p>
          Tables display which termbases actually define concepts in the
          displayed domain. It doesn't show which termbases <i>could</i> do so.
        </p>
      </div>
      <div class="space-y-2">
        <h3 class="text-xl">Directly defined in domain</h3>
        <DataTable
          :value="displayData"
          removable-sort
          sort-field="concepts"
          :sort-order="-1"
          table-style="min-width: 1rem"
        >
          <Column sortable field="label" header="Bokmål" />
          <Column sortable field="concepts" header="Begreper" />
        </DataTable>
      </div>

      <div class="space-y-2">
        <h3 class="text-xl">Defined in subdomains</h3>
        <DataTable
          :value="displayDataRec"
          removable-sort
          sort-field="concepts"
          :sort-order="-1"
          table-style="min-width: 1rem"
        >
          <Column sortable field="label" header="Bokmål" />
          <Column sortable field="concepts" header="Begreper" />
        </DataTable>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { prefix } from "termportal-ui/utils/utils";

const props = defineProps({ domain: { type: Object, required: true } });

const query = `${prefix}
PREFIX base: <http://wiki.terminologi.no/index.php/Special:URIResolver/>

SELECT ?label (COUNT(?concept) AS ?concepts)
WHERE {
  GRAPH <urn:x-arq:UnionGraph> {
    ?concept skosp:domene base:DOMENE-3A${props.domain.id} .
    ?concept skosp:memberOf ?collection .
    ?collection rdfs:label ?label .
    FILTER (lang(?label) = 'nb')
  }
}
GROUP BY ?label
`;

const { data } = await useLazyFetch("/api/withQuery", {
  method: "post",
  body: { query, internal: true },
});

const displayData = computed(() => {
  return data.value?.map((tb) => {
    return { label: tb.label.value, concepts: tb.concepts.value };
  });
});

const queryRecursive = `
PREFIX base: <http://wiki.terminologi.no/index.php/Special:URIResolver/>
${prefix}

SELECT ?label (COUNT(DISTINCT ?concept) AS ?concepts)
WHERE {
  GRAPH <urn:x-arq:UnionGraph> {
    base:DOMENE-3A${props.domain.id} skos:narrower+ ?subdomain .
    ?concept skosp:domene ?subdomain ;
             skosp:memberOf ?collection .
    ?collection rdfs:label ?label .
    FILTER (lang(?label) = 'nb')
  }
}
GROUP BY ?label
`;

const { data: dataRec } = await useLazyFetch("/api/withQuery", {
  method: "post",
  body: { query: queryRecursive, internal: true },
});

const displayDataRec = computed(() => {
  return dataRec.value?.map((tb) => {
    return { label: tb.label.value, concepts: tb.concepts.value };
  });
});
</script>
