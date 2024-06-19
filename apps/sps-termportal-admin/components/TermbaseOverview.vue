<template>
  <section>
    <h1 class="mb-6 text-2xl">Termbase oversikt</h1>
    <DataTable
      v-model:filters="filters"
      v-model:selection="selectedTermbase"
      selection-mode="multiple"
      :value="merged"
      removable-sort
      paginator
      :rows="15"
      filter-display="row"
      table-style="min-width: 1rem"
      :global-filter-fields="['label', 'id', 'conceptCount']"
    >
      <template #header>
        <div class="flex">
          <InputText v-model="filters['global'].value" placeholder="Søk" />
        </div>
      </template>
      <Column selection-mode="multiple" header-style="width: 3rem"></Column>
      <Column sortable field="label" header="Navn" />
      <!-- <Column sortable field="id" header="ID" /> -->
      <Column sortable field="conceptCount" header="Begreper" />
      <Column
        sortable
        header="Status"
        field="status"
        filter-field="status"
        :show-filter-menu="false"
      >
        <template #body="{ data }">
          <div class="flex align-items-center gap-2">
            <span>{{ data.status }}</span>
            <div
              v-if="
                data.status !== '1. kjent' && data.status !== '5. publisert'
              "
            >
              <Icon
                v-if="data.blocker.status === 'ok'"
                name="mdi:play"
                size="1.6em"
                :color="blockerColorMapping.ok.color"
              />
              <Icon
                v-else-if="data.blocker.status === 'soft'"
                name="mdi:pause"
                size="1.6em"
                :color="blockerColorMapping.soft.color"
              />
              <Icon
                v-else-if="data.blocker.status === 'hard'"
                name="mdi:stop"
                size="1.6em"
                :color="blockerColorMapping.hard.color"
              />
            </div>

            <Icon
              v-else-if="
                data.status !== '1. kjent' && data.blocker.status !== 'ok'
              "
              name="fa6-solid:triangle-exclamation"
              size="1.2em"
              :color="
                data.blocker.status === 'hard'
                  ? blockerColorMapping.hard.color
                  : blockerColorMapping.soft.color
              "
              class="ml-[6px] mt-[3px]"
            />
          </div>
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <MultiSelect
            v-model="filterModel.value"
            :options="statuses"
            option-label="name"
            placeholder="Alle"
            class="p-column-filter"
            style="min-width: 10rem"
            :max-selected-labels="0"
            @change="filterCallback()"
          >
            <template #option="slotProps">
              <div class="flex align-items-center gap-2">
                <span>{{ slotProps.option }}</span>
              </div>
            </template>
          </MultiSelect>
        </template>
      </Column>
      <Column field="labels" header="Navn." data-type="boolean">
        <template #body="{ data }">
          <div class="flex align-items-center gap-2">
            <span>{{ data.labels ? "Ja" : "Nei" }}</span>
          </div>
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <TriStateCheckbox
            v-model="filterModel.value"
            @change="filterCallback()"
          />
        </template>
      </Column>
      <Column field="descriptions" header="Beskr." data-type="boolean">
        <template #body="{ data }">
          <div class="flex align-items-center gap-2">
            <span>{{ data.descriptions ? "Ja" : "Nei" }}</span>
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
        sortable
        field="license"
        header="Lisens"
        :show-filter-menu="false"
      >
        <template #body="{ data }">
          <div class="flex align-items-center gap-2">
            <span>{{ data.license }}</span>
          </div>
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <MultiSelect
            v-model="filterModel.value"
            :options="licenses"
            option-label="name"
            placeholder="Alle"
            class="p-column-filter"
            style="min-width: 10rem"
            :max-selected-labels="0"
            @change="filterCallback()"
          >
            <template #option="slotProps">
              <div class="flex align-items-center gap-2">
                <span>{{ slotProps.option }}</span>
              </div>
            </template>
          </MultiSelect>
        </template>
      </Column>
      <Column
        sortable
        field="agreement"
        header="Avtale"
        :show-filter-menu="false"
      >
        <template #body="{ data }">
          <div class="flex align-items-center gap-2">
            <span>{{ data.agreement }}</span>
          </div>
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <MultiSelect
            v-model="filterModel.value"
            :options="agreementStatuses"
            option-label="name"
            placeholder="Alle"
            class="p-column-filter"
            style="min-width: 10rem"
            :max-selected-labels="0"
            @change="filterCallback()"
          >
            <template #option="slotProps">
              <div class="flex align-items-center gap-2">
                <span>{{ slotProps.option }}</span>
              </div>
            </template>
          </MultiSelect>
        </template>
      </Column>
      <Column sortable field="staff" header="Ansatt" :show-filter-menu="false">
        <template #body="{ data }">
          <div class="flex align-items-center gap-2">
            <span>{{ data.staff }}</span>
          </div>
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <MultiSelect
            v-model="filterModel.value"
            :options="staffMembers"
            option-label="name"
            placeholder="Alle"
            class="p-column-filter"
            style="min-width: 10rem"
            :max-selected-labels="0"
            @change="filterCallback()"
          >
            <template #option="slotProps">
              <div class="flex align-items-center gap-2">
                <span>{{ slotProps.option }}</span>
              </div>
            </template>
          </MultiSelect>
        </template>
      </Column>
      <Column header="">
        <template #body="slotProps">
          <NuxtLink
            v-if="
              ['4. opprettet', '5. publisert'].includes(slotProps.data.status)
            "
            :to="`${wikiPageLink}${slotProps.data.id.replace(
              '*',
              ''
            )}:${slotProps.data.id.replace('*', '')}`"
            target="_blank"
          >
            Wiki
          </NuxtLink>
        </template>
      </Column>
      <Column header="">
        <template #body="slotProps">
          <NuxtLink
            v-if="slotProps.data._id"
            :to="`${studioBaseRoute}/termbase;${slotProps.data._id}`"
            target="_blank"
          >
            Studio
          </NuxtLink>
        </template>
      </Column>
    </DataTable>
  </section>
</template>

<script setup lang="ts">
import { FilterMatchMode } from "primevue/api";

const runtimeConfig = useRuntimeConfig();

const selectedTermbase = ref([]);
const props = defineProps({
  modelValue: { type: Array, required: true },
});
const emits = defineEmits(["update:modelValue"]);

watch(selectedTermbase, () => {
  emits("update:modelValue", selectedTermbase.value);
});

const { data: dbdata } = await useLazyFetch("/api/tb/all/overview", {
  query: { internal: true },
});

const query = `*[_type == "termbase"]{
  ...,
  "responsibleStaff": responsibleStaff->label
}`;

const { data: cmsdata } = useLazySanityQuery(query);

function matchid(data, entry, key) {
  return data.value?.find((d) => d.id === entry.id.value)?.[key];
}

const merged = computed(() => {
  const enriched = dbdata.value?.results?.bindings
    .map((e) => ({
      label: e.label.value,
      id: e.id.value,
      conceptCount: e.concepts.value,
      status: numberStatus(matchid(cmsdata, e, "status")),
      labels: matchid(cmsdata, e, "labelsOk"),
      descriptions: matchid(cmsdata, e, "descriptionsOk"),
      license: e.license
        ? licenseLabels[e.license.value.replace(runtimeConfig.public.base, "")]
        : "",
      agreement: matchid(cmsdata, e, "licenseAgreementStatus"),
      staff: matchid(cmsdata, e, "responsibleStaff"),
      _id: matchid(cmsdata, e, "_id"),
    }))
    .filter((termbase) => termbase.id !== "DOMENE");

  if (enriched && cmsdata.value) {
    const ids = dbdata.value?.results?.bindings.map((e) => e.id.value);
    for (const entry of cmsdata.value) {
      if (!ids.includes(entry.id)) {
        const data = {
          label: entry.label,
          id: entry.id,
          status: numberStatus(entry.status),
          labels: entry.labelsOk,
          descriptions: entry.descriptionsOk,
          agreement: entry.licenseAgreementStatus,
          staff: entry.responsibleStaff,
          domain: entry.domain,
          _id: entry._id,
        };
        enriched.push(data);
      }
    }
  }

  const blocker = enriched?.map((tb) => ({
    ...tb,
    ...{ blocker: checkBlocker(tb) },
  }));
  return blocker;
});

function checkBlocker(tb) {
  const blocker = { hard: {}, soft: {}, status: "ok" };
  if (tb.status) {
    const statusNumber = Number(tb.status[0]);

    // 2. planlagt or further
    if (statusNumber > 1) {
      // soft
      if (!tb.staff) {
        blocker.soft.staff = "No responsible staff assigned.";
      }
    }
    // 3. initialisert or further
    if (statusNumber > 2) {
      // hard
      if (!tb.id) {
        blocker.hard.id = "No ID defined.";
      }
      // soft
      if (!tb.domain && statusNumber < 5) {
        blocker.soft.domain = "No domain provided.";
      }
    }
    // 4. opprettet or further
    if (statusNumber > 3) {
      // hard
      if (!tb.license) {
        blocker.hard.license = "No license registered.";
      }
      if (!tb.agreement || tb.agreement === "ingen") {
        blocker.hard.agreement = "No agreement registered.";
      }
      if (!tb.labels) {
        blocker.hard.labels = "Labels not approved.";
      }
      if (!tb.descriptions) {
        blocker.hard.descriptions = "Descriptions not approved.";
      }
    }

    if (Object.keys(blocker.hard).length > 0) {
      blocker.status = "hard";
    } else if (Object.keys(blocker.soft).length > 0) {
      blocker.status = "soft";
    }
  } else {
    blocker.hard.status = "No status registered";
    blocker.status = "hard";
  }

  return blocker;
}

const statuses = computed(() => {
  const statusArray = merged.value?.map((tb) => {
    return tb.status;
  });

  return [...new Set(statusArray)].sort().reverse();
});

const licenses = computed(() => {
  const licenseArray = merged.value?.map((tb) => {
    return tb.license;
  });

  return [...new Set(licenseArray)].sort().reverse();
});

const agreementStatuses = computed(() => {
  const statusArray = merged.value?.map((tb) => {
    return tb.agreement;
  });

  return [...new Set(statusArray)].sort().reverse();
});

const staffMembers = computed(() => {
  const staffArray = merged.value?.map((tb) => {
    return tb.staff;
  });

  return [...new Set(staffArray)].sort().reverse();
});

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  descriptions: { value: null, matchMode: FilterMatchMode.EQUALS },
  labels: { value: null, matchMode: FilterMatchMode.EQUALS },
  status: { value: null, matchMode: FilterMatchMode.IN },
  license: { value: null, matchMode: FilterMatchMode.IN },
  agreement: { value: null, matchMode: FilterMatchMode.IN },
  staff: { value: null, matchMode: FilterMatchMode.IN },
});
</script>
