<template>
  <NuxtLink v-if="linkType === 'internal'" :to="to"><slot /></NuxtLink>
  <a v-else-if="linkType === 'pageinternal'" :href="to"><slot /></a>
  <NuxtLink v-else-if="linkType === 'external'" :to="to" target="_blank"
    ><span class="icon-pad">
      <slot />
    </span>
    <Icon name="mdi:external-link" aria-hidden="true"
  /></NuxtLink>
  <NuxtLink v-else :to="to"><slot /></NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps({
  to: { type: String, required: true },
});
const linkType = computed(() => {
  if (props.to.startsWith("/")) {
    return "internal";
  } else if (props.to.startsWith("#")) {
    return "pageinternal";
  } else if (props.to.startsWith("http")) {
    return "external";
  }
});
</script>

<style>
.icon-pad {
  padding-right: 2px;
}
</style>
