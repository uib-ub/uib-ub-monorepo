<template>
  <figure class="border-solid border p-2">
    <ImgBase
      :img-src="displayInfo.image[0].value['@id']"
      img-alt="TODO"
    ></ImgBase>
    <figcaption v-if="displayInfo.image[0]?.note">
      {{ displayInfo.image[0]?.note }}
    </figcaption>
  </figure>
</template>

<script setup lang="ts">
const props = defineProps({ displayInfo: { type: Object, required: true } });
</script>
