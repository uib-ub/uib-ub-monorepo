<template>
  <li class="">
    <AppLink
      v-if="to"
      :to="to"
      class="tp-hover-focus block border-transparent px-2 py-1.5 decoration-inherit hover:text-gray-800 focus:text-gray-800"
    >
      <slot></slot>
    </AppLink>
    <div
      v-else
      class="tp-hover-focus border-transparent px-2 py-1.5 decoration-inherit"
    >
      <slot></slot>
    </div>
  </li>
</template>

<script setup lang="ts">
const props = defineProps({ to: { type: String, default: "" } });
</script>
