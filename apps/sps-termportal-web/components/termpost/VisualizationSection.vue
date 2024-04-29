<template>
  <div class="max-w-prose">
    <figure class="border-solid border p-2 rounded-sm space-y-2">
      <ImgBase
        :img-src="displayInfo.image[0].value['@id']"
        img-alt="TODO"
      ></ImgBase>
      <figcaption v-if="caption">
        {{ caption }}
      </figcaption>
    </figure>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({ displayInfo: { type: Object, required: true } });

const caption = computed(() => {
  let caption;
  const captions = props?.displayInfo?.image[0]?.note.reduce((acc, curr) => {
    acc[curr["@language"]] = curr["@value"];
    return acc;
  }, {});

  for (const lang in languageOrder) {
    if (Object.keys(captions).includes(lang)) {
      caption = captions[lang];
      break;
    }
  }
  return caption;
});
</script>
