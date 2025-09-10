<template>
  <ul class="plain-list space-y-0.5" :class="indent == 'true' ? 'plain-list-indent' : ''">
    <slot mdc-unwrap="p ul" />
  </ul>
</template>

<script setup lang="ts">
const props = defineProps({
  indent: { type: String, default: "false" },
});

</script>

<style>
.plain-list {
  margin-top: 0.25rem;
  }

.plain-list-indent {
  margin-left: 2em;
  margin-top: 0.55rem;
}
</style>
