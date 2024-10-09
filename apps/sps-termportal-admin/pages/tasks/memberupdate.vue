<template>
  <main class="space-y-2 pt-8">
    <h1 class="mb-2 text-2xl">Termgrupper medlemsoppdatering</h1>

    <div v-if="activity?.length < 1">
      Ingen pågående oppdatering av termgruppemedlemmer.
    </div>
    <section>
      <h2 class="text-xl pb-3 font-semibold">Pågående aktivitet</h2>
      <div class="max-w-prose space-y-3">
        <AppLink
          :to="`/studio/structure/activity;${activity?._id}`"
          target="_blank"
          class="flex justify-between hover:bg-gray-100 p-1"
        >
          <div>{{ activity?.label }}</div>
          <div class="flex space-x-3">
            <div>{{ activity?.timespan.edtf }}</div>
            <div>Studio</div>
          </div>
        </AppLink>
        <div v-if="activity?.note" class="p-1">
          <TpSanityContent :blocks="activity.note" />
        </div>
      </div>
    </section>
    <section class="max-w-5xl space-y-3">
      <h2 class="text-xl pb-3 font-semibold">Termgrupper</h2>
      <DataTable
        ref="datatable"
        v-model:selection="selectedTermbase"
        v-model:expandedRows="expandedRows"
        selection-mode="single"
        :value="termgroupProc"
        removable-sort
      >
        <template #header>
          <div class="flex justify-end">
            <Button class="h-9" text label="Expand All" @click="expandAll" />
            <Button
              class="h-9"
              text
              label="Collapse All"
              @click="collapseAll"
            />
            <!-- <InputText v-model="filters['global'].value" placeholder="Søk" /> -->
            <Button class="h-9 ml-6" label="Eksport" @click="exportData()" />
          </div>
        </template>
        <Column expander style="width: 3rem" />
        <Column selection-mode="single" header-style="width: 3rem"></Column>
        <Column field="label" header="Navn" sortable></Column>
        <Column field="status" header="Status" sortable>
          <template #body="slotProps">
            <Icon
              name="material-symbols:circle"
              size="1.9em"
              class=""
              :class="
                slotProps.data.status
                  ? colorMappingStatus.ok.color
                  : colorMappingStatus.error.color
              "
            >
            </Icon>
          </template>
        </Column>
        <Column header="">
          <template #body="slotProps">
            <AppLink
              :to="`${studioBaseRoute}/group;${slotProps.data.id}`"
              target="_blank"
              class="hover:bg-gray-100 p-1 rounded"
            >
              Studio
            </AppLink>
          </template>
        </Column>

        <!-- Expanded -->
        <template #expansion="slotProps">
          <div class="py-2 space-y-3">
            <div class="space-y-1">
              <h3 class="font-semibold">Kontakt termbase:</h3>
              <div
                v-for="tb in slotProps.data.contact"
                :key="tb"
                class="flex space-x-2"
              >
                <div class="font-semibold">{{ tb.label }}:</div>
                <div v-for="person in tb.contactPerson" :key="person">
                  <AppLink
                    :to="`mailto:${person.email}`"
                    class="underline hover:decoration-2"
                    >{{ person.label }}</AppLink
                  >
                </div>
              </div>
            </div>
            <div v-if="slotProps.data.note" class="">
              <h3 class="font-semibold">Merknad</h3>
              <div class="content-page">
                <TpSanityContent :blocks="slotProps.data.note" />
              </div>
            </div>
          </div>
        </template>
      </DataTable>

      <!-- Text -->
      <div class="space-y-3">
        <div class="flex space-x-4 items-center">
          <Icon
            name="material-symbols:circle"
            size="1.9em"
            class=""
            :class="colorMappingStatus.ok.color"
          >
          </Icon>
          <p>
            Termgroup has been registered in the activity - signifying its
            members have been updated.
          </p>
        </div>
        <div class="flex space-x-4 items-center">
          <Icon
            name="material-symbols:circle"
            size="1.9em"
            class=""
            :class="colorMappingStatus.error.color"
          >
          </Icon>
          <p>Termgroup has not been registered in the activity.</p>
        </div>
      </div>
    </section>

    <!-- Members -->
    <TermgroupMembers
      v-if="selectedTermbase"
      :key="selectedTermbase?.contact.map((contact) => contact._id).join('-')"
      :termbases="selectedTermbase?.contact.map((contact) => contact._id)"
      class="max-w-5xl"
    />
  </main>
</template>

<script setup lang="ts">
const datatable = ref();
const expandedRows = ref();
const selectedTermbase = ref();

const queryActivity = `
*[_type == "activity"
  && type == "termgruppeOppdatering"
  && !defined(timespan.endOfTheEnd)]
  {
    _id,
    label,
    note,
    timespan,
    "groups": qualifiedUsage[]{group->{_id}}
  }
`;

const { data: activities } = useLazySanityQuery(queryActivity);
const activity = computed(() => activities.value?.[0]);
const activityGroups = computed(() =>
  activity.value?.groups?.map((g) => g?.group?._id)
);

const queryGroup = `
*[_type == "group"]{
  _id,
  label,
  note,
  "termbase": *[ _type == "termbase" && references(^._id) ]
               { _id, label, contactPerson[]->{label, email} },
}
`;
const { data: termgroup } = useLazySanityQuery(queryGroup);

const termgroupProc = computed(() => {
  const tgData = termgroup.value
    ?.filter((tg) => tg.termbase.length > 0)
    .map((tg) => {
      const tmp = {
        _id: tg._id,
        label: tg.label,
        note: tg.note,
        status: activityGroups.value?.includes(tg._id),
        contact: tg.termbase,
      };
      return tmp;
    });

  return tgData;
});

const tmp = computed(() =>
  termgroupProc.value?.reduce((acc, curr) => {
    acc[curr.id] = ref(null);
    return acc;
  }, {})
);

const exportData = () => {
  datatable.value.exportCSV();
};

const expandAll = () => {
  expandedRows.value = termgroupProc.value;
};
const collapseAll = () => {
  expandedRows.value = null;
};
</script>
