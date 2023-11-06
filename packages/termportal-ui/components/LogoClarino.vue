<template>
  <ImgBase
    img-src="/logo_clarino.png"
    :img-style="imgStyle"
    img-alt="logo clarino"
  />
</template>

<script setup>
const props = defineProps({
  imgStyle: { type: String, default: "" },
  logoType: { type: String, default: "pos" },
});
</script>
