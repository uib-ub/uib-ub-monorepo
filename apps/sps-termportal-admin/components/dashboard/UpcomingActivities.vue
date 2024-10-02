<template>
  <section>
    <div class="flex justify-between">
      <h2 class="text-lg font-semibold pb-2 text-gray-800">
        Forestående aktiviteter
      </h2>
      <AddButton :to="studioLinks.newActivity" target="_blank" />
    </div>
    <ol class="space-y-0.5 text-lg ml-1">
      <li
        v-for="activity in procdata"
        :key="activity.label + activity.end"
        class="hover:bg-gray-100 p-1"
      >
        <AppLink
          class="space-x-3 flex justify-between"
          :to="`/studio/structure/activity;${activity.id}`"
          target="_blank"
        >
          <div>{{ activity.label }}</div>
          <div>{{ activity.time }}</div>
        </AppLink>
      </li>
    </ol>
  </section>
</template>

<script setup>
const query = `
*[_type == "activity"
  && dateTime(timespan.beginOfTheBegin) > dateTime(now())]{
  _id,
  label,
  "start": timespan.beginOfTheBegin,
  "end": timespan.endOfTheEnd,
} | order(start asc)[0...10]`;

const { data } = useLazySanityQuery(query);

const procdata = computed(() =>
  data.value?.map((a) => {
    const tmp = {
      id: a._id,
      label: a.label,
      get time() {
        const start = prettyPrintDate(a.start?.substring(0, 10));
        const end = prettyPrintDate(a.end?.substring(0, 10));
        if (start === end) {
          return end;
        } else {
          return `${start}–${end}`;
        }
      },
    };
    return tmp;
  })
);
</script>
