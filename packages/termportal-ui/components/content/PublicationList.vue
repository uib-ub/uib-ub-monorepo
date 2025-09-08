<template>
  <ol class="publication-list space-y-1.5">
    <ContentSlot :use="$slots.default" unwrap="p" />
  </ol>
</template>

<style scoped>
.publication-list {
  padding-left: 0em;
  list-style-type: none;
  }
</style>
