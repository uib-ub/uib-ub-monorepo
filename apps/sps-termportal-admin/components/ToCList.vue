<template>
  <ul class="space-y-3">
    <li v-for="item in items" :key="item.content">
      <AppLink
        :to="`#${item.id}`"
        class="hover:underline underline-offset-2 font-semibold group-[.subheadings]:font-normal"
        >{{ item.content }}</AppLink
      >
      <ToCList
        v-if="item.subheadings.length"
        :items="item.subheadings"
        class="mt-2 ml-5 group subheadings"
      ></ToCList>
    </li>
  </ul>
</template>

<script setup>
const props = defineProps({
  items: { type: Array, required: true },
});
</script>
