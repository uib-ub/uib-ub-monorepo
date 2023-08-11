<template>
  <li>
    <AppLink
      :to="to"
      class="tp-hover-focus border-transparent px-2 py-1.5 decoration-inherit hover:text-black focus:text-black"
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
