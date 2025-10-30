<template>
  <Icon
    name="mdi:external-link"
    :size="size"
    aria-hidden="true"
  />
</template>

<script setup lang="ts">

withDefaults(defineProps<{
  size?: string | number
}>(), {
  size: '1.05em',
})
</script>
