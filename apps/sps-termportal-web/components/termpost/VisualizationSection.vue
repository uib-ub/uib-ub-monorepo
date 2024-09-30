<template>
  <div class="max-w-prose lg:mx-2">
    <h3 id="vis" class="pb-1 text-xl sr-only">
      {{ $t("id.visualization") }}
    </h3>
    <figure class="rounded-sm space-y-2">
      <AppLink
        :to="displayInfo.image[0]?.value['@id']"
        :hide-icon="true"
        class="min-w-full"
      >
        <ImgBase
          :img-src="displayInfo.image[0]?.value['@id']"
          :img-alt="`${$t('id.imageAltLabel')} '${pagetitle}'`"
          class="border-solid border lg:p-2 p-1 justify-center max-h-[17em] lg:min-w-[22em] lg:max-w-[30em]"
          img-style="width: 100%"
        ></ImgBase>
        <figcaption v-if="caption" class="pt-2">
          {{ caption }}
        </figcaption>
      </AppLink>
    </figure>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  displayInfo: { type: Object, required: true },
  pagetitle: { type: String, required: true },
});

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
