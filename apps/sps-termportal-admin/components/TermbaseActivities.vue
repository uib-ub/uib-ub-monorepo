<template>
  <div class="">
    <h2 class="my-6 text-xl">Termbase Activities</h2>
    <DataTable
      :value="procdata"
      removable-sort
      paginator
      :rows="15"
      sort-field="start"
      :sort-order="-1"
    >
      <Column field="label" header="Label" sortable />
      <Column field="type" header="type" sortable />
      <Column field="start" header="Start" sortable />
      <Column field="end" header="Slutt" sortable />
      <Column field="termbase" header="Termbase" sortable />
      <Column header="">
        <template #body="slotProps">
          <NuxtLink
            :to="`/studio/desk/activity;${slotProps.data.id}`"
            target="_blank"
          >
            Rediger
          </NuxtLink>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({ termbases: { type: Object, required: true } });

const tbString = Object.keys(props.termbases).map((tb) => `'${tb}'`);
const query = `
*[_type == "activity"]{
  _id,
  label,
  type,
  timespan,
  qualifiedUsage[ scope._ref == 'eb281dfd-073c-4a9e-b2a0-95a6e25f3516' &&
                  termbase._ref in [${tbString}] ]{
                    termbase
                  }
}
  `;

const { data } = useLazySanityQuery(query);

const procdata = computed(() => {
  const tmp = data.value
    ?.filter(
      (activity) =>
        activity.qualifiedUsage && activity.qualifiedUsage.length > 0
    )
    .map((activity) => {
      return {
        id: activity._id,
        label: activity.label,
        type: activityTypes[activity.type] || activity.type,
        start: activity.timespan.beginOfTheBegin?.substring(0, 10),
        end: activity.timespan.endOfTheEnd?.substring(0, 10),
        termbase: activity.qualifiedUsage
          .map((usage) => props.termbases[usage.termbase._ref])
          .join(", "),
      };
    });
  return tmp;
});
</script>
