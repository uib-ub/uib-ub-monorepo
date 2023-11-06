<template>
  <div>
    <img :src="imgSrc" :style="imgStyle" :alt="imgAlt" aria-hidden="true" />
  </div>
</template>

<script setup>
const props = defineProps({
  imgSrc: { type: String, required: true },
  imgStyle: { type: String, default: "" },
  imgAlt: { type: String, required: true },
});
</script>
