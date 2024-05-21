<template>
  <ol class="space-y-2 publication-list">
    <ContentSlot :use="$slots.default" unwrap="p" />
  </ol>
</template>

<style scoped>
.publication-list {
  padding-left: 0em;
  list-style-type: none;
}
</style>
