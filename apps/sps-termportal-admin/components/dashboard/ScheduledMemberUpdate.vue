<template>
  <li
    v-if="getCurrentDateArray()[1] >= 8 && data?.length < 1"
    class="flex space-x-4 hover:bg-gray-100 p-1"
  >
    Termgrupper medlemsoppdatering (september/november)
  </li>
</template>

<script setup lang="ts">
import { getCurrentDateArray } from "~/utils/utils";

const query = `
*[_type == "activity"
  && type == "termgruppeOppdatering"
  && dateTime(timespan.beginOfTheBegin) > dateTime("${
    getCurrentDateArray()[0]
  }-08-01T00:00:00Z") ]{
  _id,
  label,
  "begin": timespan.beginOfTheBegin,
} | order(begin desc)[0...1]`;

const { data } = useLazySanityQuery(query);
</script>
