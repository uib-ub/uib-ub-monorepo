<template>
  <section>
    <h1 class="mb-6 text-2xl">Termbase oversikt</h1>
    <DataTable
      ref="datatable"
      v-model:filters="filters"
      v-model:selection="selectedTermbase"
      v-model:expandedRows="expandedRows"
      selection-mode="checkbox"
      :value="merged"
      removable-sort
      paginator
      :rows="12"
      filter-display="row"
      table-style="min-width: 1rem"
      :global-filter-fields="['label', 'id', 'conceptCount']"
    >
      <template #header>
        <div class="flex justify-between">
          <InputText v-model="filters['global'].value" placeholder="Søk" />
          <Button class="h-10" label="Eksport" @click="exportData()" />
        </div>
      </template>
      <Column expander style="width: 3rem" />
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
      <Column field="lastActivityDate" header="Siste aktivitet" sortable>
        <template #body="{ data }">
          <div v-if="data.lastActivityDate">{{ data.lastActivityDate }} d.</div>
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
      <template #expansion="slotProps">
        <div class="p-2 space-y-3 max-w-4xl">
          <!-- <pre>{{ slotProps.data }}</pre> -->
          <h2 class="text-xl my-2 font-semibold">Info</h2>
          <dl class="flex space-x-12">
            <div>
              <div v-if="slotProps.data?.id" class="flex space-x-5">
                <dt class="font-semibold w-16">ID</dt>
                <dd>{{ slotProps.data?.id }}</dd>
              </div>
              <div v-if="slotProps.data?.type" class="flex space-x-5">
                <dt class="font-semibold w-16">Type</dt>
                <dd>{{ slotProps.data?.type }}</dd>
              </div>
              <div v-if="slotProps.data?.contact" class="flex space-x-5">
                <dt class="font-semibold w-16">Kontakt</dt>
                <dd>
                  <div
                    v-for="contact in slotProps.data?.contact"
                    :key="contact._id"
                  >
                    <div v-if="!contact.email" class="">
                      {{ contact.label }}
                    </div>
                    <AppLink
                      v-else
                      class="underline hover:decoration-2"
                      :to="`mailto:${contact.email}`"
                      >{{ contact.label }}</AppLink
                    >
                  </div>
                </dd>
              </div>
            </div>
            <div>
              <div v-if="slotProps.data?.labels" class="flex space-x-5">
                <dt class="font-semibold w-36">Navn sjekket</dt>
                <dd>{{ slotProps.data.labels ? "Ja" : "Nei" }}</dd>
              </div>
              <div v-if="slotProps.data?.descriptions" class="flex space-x-5">
                <dt class="font-semibold w-36">Beskrivelse sjekket</dt>
                <dd>{{ slotProps.data.descriptions ? "Ja" : "Nei" }}</dd>
              </div>
            </div>
          </dl>
          <div v-if="slotProps.data.note" class="content-page">
            <h2 class="text-xl my-1 font-semibold">Merknad</h2>
            <TpSanityContent :blocks="slotProps.data.note" />
          </div>
          <div v-if="slotProps.data.lastActivity">
            <h2 class="text-xl my-1 font-semibold">Siste aktivitet</h2>
            <AppLink
              class="space-x-3 flex"
              :to="`/studio/structure/activity;${slotProps.data.lastActivity._id}`"
              target="_blank"
            >
              <h3 class="text-lg font-semibold">
                {{ slotProps.data.lastActivity.label }}
                <span v-if="slotProps.data.lastActivity.timespan"
                  >({{ slotProps.data.lastActivity.timespan.edtf }})</span
                >
              </h3>
            </AppLink>

            <div class="content-page">
              <TpSanityContent
                v-if="slotProps.data.lastActivity.note"
                :blocks="slotProps.data.lastActivity.note"
              />
            </div>
          </div>
          <TermbaseBlocker
            v-if="slotProps.data?.blocker?.status !== 'ok'"
            :key="'blocker' + selectedTermbase.map((tb) => tb._id).join('')"
            :termbases="[slotProps.data]"
            :inline="true"
          />
        </div>
      </template>
    </DataTable>
  </section>
</template>

<script setup lang="ts">
import { FilterMatchMode } from "primevue/api";
import { getDaysDiff } from "~/utils/utils";

const runtimeConfig = useRuntimeConfig();

const expandedRows = ref([]);
const selectedTermbase = ref([]);
const props = defineProps({
  modelValue: { type: Array, required: true },
});
const emits = defineEmits(["update:modelValue"]);

watch(selectedTermbase, () => {
  emits("update:modelValue", selectedTermbase.value);
});

const { data: dbdata } = await useLazyFetch("/api/tb/all/termbase_overview", {
  query: { internal: true },
});

const query = `*[_type == "termbase"]{
  ...,
  "lastActivity": *[_type == "activity"
                    && references(^._id)]
                    {
                      _id,
                      label,
                      note,
                      timespan
                    } | order(timespan.endOfTheEnd desc)[0...1],
  "responsibleStaff": responsibleStaff->label,
  "contact": contactPerson[]->{_id, label, email}
}`;

const { data: cmsdata } = useLazySanityQuery(query);

function matchid(data, entry, key) {
  return data.value?.find((d) => d.id === entry.id.value)?.[key];
}

const getLicense = (value) =>
  value
    ? licenseLabels[value.replace(runtimeConfig.public.base, "")] ??
      value.replace(runtimeConfig.public.base, "")
    : "";

const merged = computed(() => {
  // enrich dbdata with cms data
  const enriched = dbdata.value
    ?.map((e) => ({
      label: e.label.value,
      id: e.id.value,
      conceptCount: e.concepts.value,
      status: numberStatus(matchid(cmsdata, e, "status")),
      labels: matchid(cmsdata, e, "labelsOk"),
      descriptions: matchid(cmsdata, e, "descriptionsOk"),
      license: getLicense(e?.license?.value),
      agreement: matchid(cmsdata, e, "licenseAgreementStatus"),
      staff: matchid(cmsdata, e, "responsibleStaff"),
      domain: matchid(cmsdata, e, "domain"),
      note: matchid(cmsdata, e, "note"),
      type: matchid(cmsdata, e, "type"),
      contact: matchid(cmsdata, e, "contact"),
      lastActivity:
        matchid(cmsdata, e, "lastActivity")?.length > 0
          ? matchid(cmsdata, e, "lastActivity")[0]
          : null,
      lastActivityDate:
        matchid(cmsdata, e, "lastActivity")?.length > 0
          ? getDaysDiff(
              matchid(
                cmsdata,
                e,
                "lastActivity"
              )[0]?.timespan?.endOfTheEnd?.substring(0, 10)
            )
          : "",
      _id: matchid(cmsdata, e, "_id"),
    }))
    .filter((termbase) => !["DOMENE", "MRT2"].includes(termbase.id));

  // get termbases that are not present in the wiki
  if (enriched && cmsdata.value) {
    const ids = dbdata.value.map((e) => e.id.value);
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
          note: entry.note,
          type: entry.type,
          contact: entry.contact,
          lastActivity:
            entry.lastActivity.length > 0 ? entry.lastActivity[0] : null,
          lastActivityDate:
            entry.lastActivity.length > 0
              ? getDaysDiff(
                  entry.lastActivity[0]?.timespan?.endOfTheEnd?.substring(0, 10)
                )
              : "",
          _id: entry._id,
        };
        enriched.push(data);
      }
    }

    const blocker = enriched?.map((tb) => ({
      ...tb,
      ...{ blocker: checkBlocker(tb) },
    }));
    return blocker;
  }
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
  status: { value: null, matchMode: FilterMatchMode.IN },
  license: { value: null, matchMode: FilterMatchMode.IN },
  agreement: { value: null, matchMode: FilterMatchMode.IN },
  staff: { value: null, matchMode: FilterMatchMode.IN },
});

const datatable = ref();
const exportData = () => {
  datatable.value.exportCSV();
};
</script>
