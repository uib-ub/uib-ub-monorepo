<template>
  <div class="flex">
    <!-- <SideBar /> -->
    <main class="space-y-6 pt-8">
      <h1 class="text-2xl">{{ merged?.label }}</h1>
      <div id="content" ref="contentRef" class="space-y-8">
        <TermbaseInfoBox v-if="merged" :termbase="merged" />
        <div class="space-y-4">
          <h2 class="text-2xl">Terminologi</h2>
          <div class="space-y-8">
            <TermbaseSubjectValues
              v-if="merged?.id && merged.conceptCount > 0"
              :key="`subjects${merged?.id}`"
              headingLevel="h3"
              :termbase="merged"
            />
            <TermbaseDefinitionsExisting
              v-if="merged?.id && merged.conceptCount > 0"
              :key="`defs${merged?.id}`"
              headingLevel="h3"
              :termbase="merged"
            />
            <TermbaseDefinitionsMissing
              v-if="merged?.id && merged.conceptCount > 0"
              :key="`qualityMissingDefs${merged?.id}`"
              headingLevel="h3"
              :termbase="merged"
            />
            <TermbaseSemanticRelations
              v-if="merged?.id && merged.conceptCount > 0"
              :key="`semanticrelations${merged?.id}`"
              headingLevel="h3"
              :termbase="merged"
            />
          </div>
        </div>
        <TermgroupMembers
          v-if="merged?.id && merged?._id"
          :key="'members' + merged?.id"
          :termbases="[merged?._id]"
        />
        <TermbaseActivities
          v-if="merged?.id && merged?._id"
          :key="'activities' + merged?.id"
          :termbases="{ [merged._id]: merged.label }"
        />
      </div>
    </main>
    <ToC
      v-if="merged?.id"
      :key="merged?.id + merged?._id"
      class="ml-10 mt-[5rem] hidden lg:block"
      content-selector="#content"
    />
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const runtimeConfig = useRuntimeConfig();
const contentRef = ref();

const { data: dbdata } = await useLazyFetch("/api/tb/all/termbase_overview", {
  query: { internal: true },
});

const query = `*[_type == "termbase" && id == "${route.params.id}"]{
  ...,
  "lastActivity": *[_type == "activity"
                    && references(^._id)
                    && defined(timespan)]
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
    ? (licenseLabels[value.replace(runtimeConfig.public.base, "")] ??
      value.replace(runtimeConfig.public.base, ""))
    : "";

function calcLastActivity(timespan: Object) {
  if (timespan?.endOfTheEnd) {
    return getDaysDiff(timespan.endOfTheEnd?.substring(0, 10));
  } else {
    return -1;
  }
}

const merged = computed(() => {
  const dbdatatb = dbdata.value?.filter((tb) => tb.id.value == route.params.id);

  const enriched = dbdatatb?.map((e) => {
    const tmp = {
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
      reminderInterval: matchid(cmsdata, e, "reminderInterval"),
      lastActivity:
        matchid(cmsdata, e, "lastActivity")?.length > 0
          ? matchid(cmsdata, e, "lastActivity")[0]
          : null,
      lastActivityDays:
        matchid(cmsdata, e, "lastActivity")?.length > 0
          ? calcLastActivity(matchid(cmsdata, e, "lastActivity")[0]?.timespan)
          : null,
      get reminderCalc() {
        if (tmp.reminderInterval && tmp.lastActivityDays !== null) {
          return -(tmp.reminderInterval - tmp.lastActivityDays);
        } else {
          return null;
        }
      },
      _id: matchid(cmsdata, e, "_id"),
    };
    return tmp;
  });

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
          license: "",
          agreement: entry.licenseAgreementStatus,
          staff: entry.responsibleStaff,
          domain: entry.domain,
          note: entry.note,
          type: entry.type,
          contact: entry.contact,
          reminderInterval: entry.reminderInterval,
          lastActivity:
            entry.lastActivity.length > 0 ? entry.lastActivity[0] : null,
          lastActivityDays:
            entry.lastActivity.length > 0
              ? calcLastActivity(entry.lastActivity[0]?.timespan)
              : null,
          get reminderCalc() {
            if (data.reminderInterval && data.lastActivityDays !== null) {
              const diff = -(data.reminderInterval - data.lastActivityDays);
              return -(data.reminderInterval - data.lastActivityDays);
            } else {
              return null;
            }
          },
          _id: entry._id,
        };
        enriched.push(data);
      }
    }
  }

  return enriched?.[0];
});
</script>
