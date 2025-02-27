<template>
  <div class="max-w-prose lg:mx-2">
    <h3 id="vis" class="sr-only pb-1 text-xl">
      {{ $t("id.visualization") }}
    </h3>
    <figure class="space-y-2 rounded-sm">
      <AppLink
        :to="displayInfo.image[0]?.value['@id']"
        :hide-icon="true"
        class="min-w-full"
      >
        <ImgBase
          :img-src="displayInfo.image[0]?.value['@id']"
          :img-alt="`${$t('id.imageAltLabel')} '${pagetitle}'`"
          class="max-h-[17em] justify-center border border-solid p-1 lg:max-h-[22em] lg:min-w-[22em] lg:max-w-[30em] lg:p-2"
          img-style="width: 100%; object-fit: contain"
        ></ImgBase>
        <figcaption v-if="caption" class="pt-2">
          {{ caption }}
        </figcaption>
      </AppLink>
    </figure>
  </div>
</template>

<script setup lang="ts">
const localeLangOrder = useLocaleLangOrder();

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

  for (const lang of localeLangOrder.value
    .filter((lc) => !dataDisplayOnlyLanguages.includes(lc))
    .slice(0, 3)) {
    if (Object.keys(captions).includes(lang)) {
      caption = captions[lang];
      break;
    }
  }
  return caption;
});
</script>
