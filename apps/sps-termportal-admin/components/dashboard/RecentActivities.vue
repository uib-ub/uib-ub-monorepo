<template>
  <section>
    <div class="flex justify-between">
      <h2 class="text-lg font-semibold pb-2 text-gray-800">
        Nylige aktiviteter
      </h2>
      <AddButton :to="studioLinks.newActivity" target="_blank" />
    </div>
    <ol class="text-lg ml-1">
      <li
        v-for="activity in procdata"
        :key="activity.label + activity.time"
        class="flex space-x-4 hover:bg-gray-100 p-1 justify-between"
      >
        <AppLink
          class="space-x-3 flex justify-between grow"
          :to="`/studio/structure/activity;${activity.id}`"
          target="_blank"
        >
          <div>{{ activity.label }}</div>
          <div>{{ activity.time }}</div>
        </AppLink>
        <div
          class="flex justify-between items-center"
          @mouseover="timeInfo = activity.label + activity.time"
          @mouseleave="timeInfo = false"
        >
          <Icon
            name="material-symbols:circle"
            size="1.8em"
            class=""
            :class="activity?.colorCoding?.color"
          >
          </Icon>
          <div
            v-show="timeInfo == activity.label + activity.time"
            class="absolute bg-white p-2 ml-10 border border-solid rounded-md"
          >
            {{ activity?.colorCoding?.description }}
          </div>
        </div>
      </li>
    </ol>
  </section>
</template>

<script setup lang="ts">
const timeInfo = ref(false);

// 86400 is a hack to display todays events.
// timespan.begiOfTheEnd is not available in groq
// timespan.endOfTheEnd defaults to ...T23:59:59.999Z for undefined times
const query = `
*[_type == "activity"
  && defined(timespan.endOfTheEnd)
  && dateTime(timespan.endOfTheEnd) < (dateTime(now()) + 86400)]{
  _id,
  label,
  "start": timespan.beginOfTheBegin,
  "end": timespan.endOfTheEnd,
} | order(end desc)[0...10]`;

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
      get colorCoding() {
        const today = new Date();
        const endDate = new Date(a.end?.substring(0, 10));
        const millisecondsPerDay = 1000 * 60 * 60 * 24;
        const distance = Math.floor(
          Math.abs((today.getTime() - endDate.getTime()) / millisecondsPerDay)
        );

        for (const number of Object.keys(colorMappingFreshness)) {
          if (distance < number) {
            return colorMappingFreshness[number];
          }
        }
      },
    };
    return tmp;
  })
);
</script>
