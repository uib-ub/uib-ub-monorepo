<template>
  <div class="">
    <h2 class="text-lg font-semibold pb-3 text-gray-800">Recent Activities</h2>
    <ol class="space-y-0.5 text-lg ml-1">
      <li
        v-for="activity in procdata"
        :key="activity.label + activity.end"
        class="flex space-x-4 hover:bg-gray-100 p-1"
      >
        <div class="w-[25rem]">{{ activity.label }}</div>
        <div>{{ activity.time }}</div>
        <div
          class="w-7 h-7 rounded-2xl"
          :style="`background-color: ${activity.colorCoding}`"
        />
      </li>
    </ol>
  </div>
</template>

<script setup>
const query = `
*[_type == "activity"]{
  label,
  "start": timespan.beginOfTheBegin,
  "end": timespan.endOfTheEnd,
} | order(end desc)[0...10]`;

const { data } = useLazySanityQuery(query);

const procdata = computed(() =>
  data.value?.map((a) => {
    const tmp = {
      label: a.label,
      get time() {
        const start = a.start?.substring(0, 10);
        const end = a.end?.substring(0, 10);
        if (start === end) {
          return end;
        } else {
          return `${start}–${end}`;
        }
      },
      get colorCoding() {
        const today = new Date();
        const endDate = new Date(a.end?.substring(0, 10));
        const millisecondsPerDay = 1000 * 60 * 60 * 24;
        const distance = Math.floor(
          Math.abs((today.getTime() - endDate.getTime()) / millisecondsPerDay)
        );
        if (distance < 2) {
          return "#FF6347";
        } else if (distance < 7) {
          return "#FFA500";
        } else if (distance < 30) {
          return "#FFD700";
        } else {
          return "#69b9fe";
        }
      },
    };
    return tmp;
  })
);
</script>
