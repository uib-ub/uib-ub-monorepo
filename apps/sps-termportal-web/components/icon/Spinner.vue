<template>
  <div role="status" class="flex items-center">
    <Icon
      class="tp-spin"
      name="icomoon-free:spinner8"
      :size="size"
      aria-hidden="true"
    />
    <span class="sr-only">{{ $t("spinnerIcon.srText") }}</span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({ size: { type: String, default: "1.5em" } });
</script>

<style scoped>
.tp-spin {
  animation-name: spin;
  animation-duration: 2s;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
