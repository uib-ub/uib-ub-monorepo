<template>
  <section class="space-y-4">
    <h2 class="text-xl">Termbases: Language coverage</h2>
    <div class="space-y-1">
      <p>Only includes published termbases and counts published concepts.</p>
    </div>
    <div class="max-w-7xl">
      <DataTable
        ref="datatable"
        v-model:filters="filters"
        :value="displayData"
        removable-sort
        table-style="min-width: 1rem"
        :global-filter-fields="['label']"
      >
        <template #header>
          <div class="flex justify-between">
            <InputText v-model="filters['global'].value" placeholder="Søk" />
            <Button class="h-10" label="Eksport" @click="exportData($event)" />
          </div>
        </template>
        <Column field="label" header="Navn" sortable />
        <Column field="count" header="Begreper" sortable />
        <Column field="tnb" header="med bokmål term" sortable />
        <Column field="tnn" header="med nynorsk term" sortable />
        <Column field="ten" header="med engelsk term" sortable />
        <Column field="publishYear" header="Publisert" sortable />
        <Column field="type" header="type" sortable />
        <Column field="topdomain" header="Domene" sortable />
        <!-- <Column field="dnb" header="med bokmål definisjon" sortable /> -->
        <!-- <Column field="dnn" header="med nynorsk definisjon" sortable /> -->
        <!-- <Column field="den" header="med engelsk definisjon" sortable /> -->
      </DataTable>
    </div>
  </section>
</template>

<script setup lang="ts">
import { FilterMatchMode } from "primevue/api";

const { data } = await useLazyFetch("/api/tb/all/termbase_language_coverage");

const query = `
*[_type == "termbase" &&
 (status == 'publisert')
]{
  _id,
  id,
  type,
  topdomain,
  "publishDate": *[_type == "activity"
                   && references(^._id)
                   && type == "termbasePublisering"]
                  { "date": timespan.endOfTheEnd }
}`;

const { data: cmsdata } = useLazySanityQuery(query);

function matchid(data, entry, key) {
  return data.value?.find((d) => d.id === entry.tbid.value)?.[key];
}

const displayData = computed(() => {
  if (data.value) {
    const mapped = data.value
      .filter((tb) => tb.tbid.value !== "DOMENE")
      .map((tb) => {
        const map = {
          id: tb.tbid.value,
          label: tb.label.value,
          count: tb.concepts.value,
          tnb: tb.termsnb.value,
          tnn: tb.termsnn.value,
          ten: tb.termsen.value,
          dnb: tb.defnb.value,
          dnn: tb.defnn.value,
          den: tb.defen.value,
          type: matchid(cmsdata, tb, "type"),
          topdomain: topDomains[matchid(cmsdata, tb, "topdomain")] || "",
          publishYear: matchid(cmsdata, tb, "publishDate")?.[0]?.date.substring(
            0,
            4
          ),
        };
        return map;
      });

    // Remove duplicates. not needed anymore?
    // const filtered = mapped?.filter((value, index) => {
    //   const _value = JSON.stringify(value);
    //   return (
    //     index ===
    //     mapped?.findIndex((obj) => {
    //       return JSON.stringify(obj) === _value;
    //     })
    //   );
    // });

    return mapped;
  }
});

const datatable = ref();
const exportData = () => {
  datatable.value.exportCSV();
};
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
</script>
