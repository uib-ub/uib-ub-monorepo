<template>
  <dt class="font-semibold">
    {{ props.title }}
  </dt>
  <dd class="text-sm text-gray-600">{{ props.date }}</dd>
  <dd class="space-y-0.5">
    <slot></slot>
    <template v-if="expand">
      <slot name="expand"></slot>
    </template>
    <button
      v-if="slots.expand"
      class="underline hover:decoration-2"
      @click="expand = !expand"
    >
      {{ expand ? $t("global.readLess") : $t("global.readMore") }}
    </button>
  </dd>
</template>

<script setup lang="ts">
const props = defineProps({
  title: { type: String, default: "" },
  date: { type: String, default: "" },
});
const slots = useSlots();

const expand = ref(false);
</script>
