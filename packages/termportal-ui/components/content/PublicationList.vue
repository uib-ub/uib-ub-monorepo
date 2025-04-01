<template>
  <ol class="publication-list">
    <ContentSlot :use="$slots.default" unwrap="p" />
  </ol>
</template>

<style scoped>
.publication-list {
  padding-left: 0em;
  list-style-type: none;
  @apply space-y-1.5;
}
</style>
