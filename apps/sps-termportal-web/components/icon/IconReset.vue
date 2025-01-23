<template>
  <div role="status" class="flex items-center">
    <Icon
      class="tp-spin"
      name="ri:reset-right-fill"
      :size="size"
      aria-hidden="true"
    />
    <span class="sr-only">{{ $t("spinnerIcon.srText") }}</span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({ size: { type: String, default: "1.5em" } });
</script>
