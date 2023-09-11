<template>
<main id="main" tabindex="-1" class="secondary-page">
        <NuxtPage/>

</main>
</template>




<script setup>
import { useI18n } from 'vue-i18n'

const i18n = useI18n()

const path = `${i18n.locale.value}/about/`

const { data } = await useAsyncData(`content-${path}`, async () => {
  return {
    intro: await queryContent(i18n.locale.value, "about").findOne(),
    sections: await queryContent(i18n.locale.value, "about").skip(1).find()
  };
});


useHead({
    title: i18n.t('about')
})

</script>



