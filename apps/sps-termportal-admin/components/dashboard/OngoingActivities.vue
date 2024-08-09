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
        class="hover:bg-gray-100 p-1"
      >
        <AppLink
          class="space-x-3 flex"
          :to="`/studio/structure/activity;${activity.id}`"
          target="_blank"
        >
          <div class="w-[18rem]">{{ activity.label }}</div>
          <div>{{ activity.begin }}/...</div>
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
  "begin": timespan.beginOfTheBegin,
} | order(begin desc)[0...10]`;

const procdata = computed(() =>
  data.value.map((a) => {
    const tmp = {
      id: a._id,
      label: a.label,
      begin: prettyPrintDate(a.begin?.substring(0, 10)),
    };
    return tmp;
  })
);

const { data } = useLazySanityQuery(query);
</script>
