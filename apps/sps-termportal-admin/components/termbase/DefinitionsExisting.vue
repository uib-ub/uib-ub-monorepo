<template>
  <UtilsTableWrapper class="max-w-6xl">
    <template #header>Definisjoner</template>
    <UtilsTableLegend>
      <p v-if="definitions?.length == 5000">
        Fetch limit set to 5000, e.g. if 5000 definitions have been fetched it
        is likely that the list doesn't contain all definitions.
      </p>
      <UtilsTableLegendEntry
        :legend-key="`${definitions?.length}`"
        legend-value="definisjoner hentet"
        legend-width="16"
      />
      <UtilsTableLegendEntry
        v-for="stat in stats"
        :key="stat[1] + stat[2] + stat[0]"
        :legend-key="`${stat[1]}/${stat[2]}`"
        :legend-value="`${stat[0]}`"
        legend-width="16"
      />
    </UtilsTableLegend>
    <div class="">
      <DataTable
        v-if="definitions?.length > 0"
        ref="datatable"
        :value="definitions"
        paginator
        :rows="15"
        removable-sort
        table-style="min-width: 1rem"
      >
        <template #header>
          <div style="text-align: right">
            <Button class="h-10" label="Eksport" @click="exportCSV()" />
          </div>
        </template>
        <Column field="concept" header="Begrep" sortable>
          <template #body="slotProps">
            <AppLink
              :to="`https://termportalen.no/tb/${slotProps.data.link}`"
              >{{ slotProps.data.concept }}</AppLink
            >
          </template>
        </Column>
        <Column field="def" header="Definisjon" sortable></Column>
        <Column field="lang" header="Språk" sortable></Column>
      </DataTable>
    </div>
  </UtilsTableWrapper>
</template>

<script setup lang="ts">
const props = defineProps({ termbase: { type: Object, required: true } });

const datatable = ref();

const { data } = useLazyFetch(`/api/tb/${props.termbase.id}/definitions`, {
  query: { internal: true },
});

const definitions = computed(() => {
  if (data.value) {
    return data?.value.map((e) => {
      return {
        concept: e.concept.value
          .split("/")
          .slice(-1)[0]
          .split("-3A")
          .slice(-1)[0],
        link: e.concept.value.split("/").slice(-1)[0].split("-3A").join("/"),
        def: e.defValue.value,
        lang: e.lang.value,
      };
    });
  }
});

const stats = computed(() => {
  if (data.value) {
    const statEntries = [];

    // Concepts with definitions
    const conceptWithDef = new Set(
      data?.value.map((e) => {
        return e.concept.value;
      })
    );
    statEntries.push([
      "begreper har en definisjon",
      conceptWithDef.size,
      props.termbase.conceptCount,
    ]);

    const counts = {};
    const langCodes = data?.value.map((e) => {
      return e.lang.value;
    });
    if (langCodes) {
      for (const num of langCodes) {
        counts[num] = counts[num] ? counts[num] + 1 : 1;
      }
    }

    Object.entries(counts).forEach(([key, value]) => {
      statEntries.push([
        `begreper har en definisjon i ${key}`,
        value,
        props.termbase.conceptCount,
      ]);
    });

    return statEntries;
  }
});

const exportCSV = () => {
  datatable.value.exportCSV();
};
</script>
