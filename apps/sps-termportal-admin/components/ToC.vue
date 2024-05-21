<template>
  <div v-if="groupedHeadings.length" class="">
    <h2 class="font-semibold text-xl mb-3">Contents</h2>
    <ToCList :items="groupedHeadings"></ToCList>
  </div>
</template>

<script setup lang="ts">
const headings = ref([]);

const props = defineProps({
  contentSelector: { type: String, required: true },
});

const groupedHeadings = computed(() => {
  const items = [...headings.value];
  for (let i = items.length - 1; i >= 0; i--) {
    const currentItem = items[i];

    let parentItem = items.findLast((item, index) => {
      return item.level < currentItem.level && index < i;
    });

    if (parentItem) {
      parentItem.subheadings.unshift(currentItem);
      items.splice(i, 1);
    }
  }
  return items;
});

onMounted(() => {
  window.document
    .querySelector(props.contentSelector)
    ?.querySelectorAll("h2, h3, h4, h5, h6")
    .forEach((el) => {
      headings.value.push({
        level: parseInt(el.tagName.charAt(1)),
        id: el.id,
        content: el.innerText,
        subheadings: [],
      });
    });
});
</script>
