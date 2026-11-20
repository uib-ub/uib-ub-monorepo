<template>
  <NotFound
    :termbase="queryParam('termbase')"
    :concept="queryParam('concept')"
  />
</template>

<script setup lang="ts">
const route = useRoute();

function queryParam(key: string) {
  const value = route.query[key];
  return typeof value === "string" ? value : null;
}
</script>
