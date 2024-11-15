<template>
  <div class="">
    Testpage
    <pre>{{ data }}</pre>
  </div>
</template>

<script setup lang="ts">
const query = `
*[_type == "activity" && (type == "termbaseOpprettelse" || type == "termbasePublisering")]
{
  type,
  "date": timespan.endOfTheEnd
}
`;

const { data } = useLazySanityQuery(query);
</script>
