<template>
  <ImgBase
    img-src="/logo_ugle_white.svg"
    :img-style="imgStyle"
    img-alt="logo UiB"
  />
</template>

<script setup>
const props = defineProps({
  imgStyle: { type: String, default: "" },
});
</script>
