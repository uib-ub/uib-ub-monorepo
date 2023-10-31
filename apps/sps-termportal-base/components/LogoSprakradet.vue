<template>
  <ImgBase :img-src="imgSrc" :img-style="imgStyle" img-alt="logo språkrådet" />
</template>

<script setup>
const props = defineProps({
  imgStyle: { type: String, default: "" },
  logoType: { type: String, default: "pos" },
});

const imgSrc = computed(() => {
  switch (props.logoType) {
    case "pos":
      return "/logo_sprakradet.png";
    case "neg":
      return "/logo_sprakradet_neg.png";
  }
});
</script>
