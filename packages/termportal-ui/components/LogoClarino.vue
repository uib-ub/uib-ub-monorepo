<template>
  <ImgBase
    img-src="/clarino.png"
    :img-style="imgStyle"
    img-alt="logo clarino"
  />
</template>

<script setup>
const props = defineProps({
  imgStyle: { type: String, default: "" },
});
</script>
