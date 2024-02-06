<template>
  <ImgBase :img-src="imgSrc" :img-style="imgStyle" img-alt="logo UiB" />
</template>

<script setup>
const props = defineProps({
  imgStyle: { type: String, default: "" },
  logoType: { type: String, default: "symbol" },
  logoNegative: { type: Boolean, default: false },
  logoLanguage: { type: String, default: "no" },
});

const imgSrc = computed(() => {
  switch (props.logoType) {
    case "symbol":
      return `/uib-symbol-${props.logoNegative ? "pos" : "neg"}.svg`;
    default:
      return "/uib-symbol-pos.svg";
  }
});
</script>
