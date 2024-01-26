<template>
  <li class="hangindent group">
    <span v-if="to">
      <AppLink :to="to">
        <ContentSlot :use="$slots.default" unwrap="p" />
        <span>{{ " " }}</span>
        <span v-if="linkDesc" class="underline group-hover:decoration-2">
          {{ linkDesc }}
        </span>
        <span v-else class="underline group-hover:decoration-2">URL</span>
      </AppLink>
      <span>.</span>
    </span>
    <span v-else> <slot />. </span>
  </li>
</template>

<script setup lang="ts">
const props = defineProps({
  to: { type: String, default: undefined },
  linkDesc: { type: String, default: undefined },
});
</script>

<style scoped>
.hangindent {
  padding-left: 2rem;
  text-indent: -2rem;
}
</style>
