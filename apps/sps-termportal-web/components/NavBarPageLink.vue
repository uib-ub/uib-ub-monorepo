<template>
  <li>
    <AppLink
      :to="to"
      class="decoration-inherit hover:text-black tp-hover-focus px-2 py-1.5 focus:text-black"
      @click="navMenuExpanded = false"
    >
      <slot></slot
    ></AppLink>
  </li>
</template>

<script setup lang="ts">
const navMenuExpanded = useNavMenuExpanded();

const props = defineProps({ to: { type: String, required: true } });
</script>
