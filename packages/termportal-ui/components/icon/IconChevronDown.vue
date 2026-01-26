<template>
    <Icon 
      name="mdi:chevron-down"
      :size="size"
      aria-hidden="true"
    />
</template>

<script setup lang="ts">

withDefaults(defineProps<{
  size?: string | number
}>(), {
  size: '1em',
})
</script>
