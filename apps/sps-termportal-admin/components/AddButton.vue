<template>
  <AppLink
    class="w-7 h-7 rounded-2xl shrink-0 bg-gray-200 mr-1.5 hover:bg-gray-300 mx-2"
    :to="to"
    :target="target"
    ><Icon
      name="mdi:plus"
      class="text-gray-600 ml-[2px] mb-[1px] hover:text-gray-700"
      size="1.5em"
    ></Icon
  ></AppLink>
</template>

<script setup lang="ts">
const props = defineProps({
  to: { type: String, required: true },
  target: { type: String, default: "" },
});
</script>
