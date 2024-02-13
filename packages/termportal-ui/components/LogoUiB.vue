<template>
  <ImgBase :img-src="imgSrc" :img-style="imgStyle" img-alt="logo UiB" />
</template>

<script setup>
const props = defineProps({
  imgStyle: { type: String, default: undefined },
  logoType: { type: String, default: undefined },
  logoNegative: { type: Boolean, default: false },
  logoLanguage: { type: String, default: "no" },
});

const imgSrc = computed(() => {
  switch (props.logoType) {
    case "symbol":
      return `/uib-symbol-${props.logoNegative ? "neg" : "pos"}.svg`;
    case "2lines":
      return `/uib-2lines-${props.logoNegative ? "neg" : "pos"}-${
        props.logoLanguage
      }.png`;
    default:
      return "/uib-symbol-pos.svg";
  }
});
</script>
