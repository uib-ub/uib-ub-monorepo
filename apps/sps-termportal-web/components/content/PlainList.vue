<template>
  <ul class="plain-list">
    <ContentSlot :use="$slots.default" unwrap="p ul" />
  </ul>
</template>

<style>
.plain-list ul {
  @apply space-y-1;
}

.plain-list-indent ul {
  margin-left: 2em;
  @apply space-y-2;
}
</style>
