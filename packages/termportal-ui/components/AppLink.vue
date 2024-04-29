<template>
  <NuxtLink v-if="linkType === 'internal'" :to="to" :target="target"
    ><slot
  /></NuxtLink>
  <a v-else-if="linkType === 'pageinternal'" :href="to" :target="target"
    ><slot
  /></a>
  <NuxtLink
    v-else-if="linkType === 'external'"
    :to="to"
    :target="target || '_blank'"
  >
    <span :class="{ 'icon-pad': !hideIcon }">
      <slot />
    </span>
    <Icon v-if="!hideIcon" name="mdi:external-link" aria-hidden="true"
  /></NuxtLink>
  <NuxtLink v-else :to="to" :target="target"><slot /></NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps({
  to: { type: String, required: true },
  target: { type: String, required: false },
  hideIcon: { type: Boolean, default: false },
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
