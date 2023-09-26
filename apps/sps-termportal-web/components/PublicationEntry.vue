<template>
  <li class="hangindent group">
    <span v-if="to" class="">
      <AppLink :to="to">
        <slot />
        <span v-if="linkDesc" class="underline group-hover:decoration-2">
          {{ linkDesc }}
        </span>
        <span v-else class="underline group-hover:decoration-2"> URL</span>
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
  padding-left: 1.5em;
  text-indent: -1.5em;
}
</style>
