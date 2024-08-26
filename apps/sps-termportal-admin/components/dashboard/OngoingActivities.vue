<template>
  <section v-if="data?.length > 0">
    <div class="flex justify-between">
      <h2 class="text-lg font-semibold pb-2 text-gray-800">
        Pågående aktiviteter
      </h2>
      <AddButton :to="studioLinks.newActivity" target="_blank" />
    </div>
    <ol class="space-y-0.5 text-lg ml-1">
      <li
        v-for="activity in procdata"
        :key="activity.id"
        class="flex space-x-2 justify-between"
      >
        <AppLink
          class="p-1 flex hover:bg-gray-100 justify-between grow space-x-3"
          :to="`/studio/structure/activity;${activity.id}`"
          target="_blank"
        >
          <div>{{ activity.label }}</div>
          <div>{{ activity.begin }}/...</div>
        </AppLink>
        <AppLink
          v-if="activity.type === 'termgruppeOppdatering'"
          class="p-1"
          to="/tasks/memberupdate"
        >
          <Icon
            name="mdi:read-more-outline"
            size="1.8em"
            class="p-1 hover:bg-gray-100 rounded"
          />
        </AppLink>
      </li>
    </ol>
  </section>
</template>

<script setup lang="ts">
const query = `
*[_type == "activity"
&& dateTime(timespan.beginOfTheBegin) < dateTime(now())
 && !defined(timespan.endOfTheEnd)
]{
  _id,
  label,
  type,
  "begin": timespan.beginOfTheBegin,
} | order(begin desc)[0...10]`;

const { data } = useLazySanityQuery(query);

const procdata = computed(() =>
  data.value.map((a) => {
    const tmp = {
      id: a._id,
      label: a.label,
      type: a.type,
      begin: prettyPrintDate(a.begin?.substring(0, 10)),
    };
    return tmp;
  })
);
</script>
