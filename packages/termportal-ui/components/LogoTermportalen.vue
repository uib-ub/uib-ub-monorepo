<template>
  <ImgBase
    :img-src="imgSrc"
    :img-style="imgStyle"
    img-alt="logo termportalen"
  />
</template>

<script setup>
const props = defineProps({
  imgStyle: { type: String, default: "" },
  logoType: { type: String, default: "full" },
});

const imgSrc = computed(() => {
  switch (props.logoType) {
    case "full":
      return "/logo-termportalen.svg";
    case "symbol":
      return "/logo-symbol-termportalen.svg";
    case "wordmark":
      return "/logo-wordmark-termportalen.svg";
  }
});
</script>
