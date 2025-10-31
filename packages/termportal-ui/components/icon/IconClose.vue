<template>
    <Icon 
      name="material-symbols:close"
      :size="size"
      aria-hidden="true"
    />
</template>

<script setup lang="ts">

withDefaults(defineProps<{
  size?: string | number
}>(), {
  size: '1.5em',
})
</script>
