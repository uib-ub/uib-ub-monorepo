<template>
<section class="secondary-page">
         <ContentRenderer :value="data">
      <ContentRendererMarkdown :value="data" />
    </ContentRenderer>
      </section>
</template>
<script setup>
import { useI18n } from "vue-i18n"

const i18n = useI18n()
const { data } = await useAsyncData('advanced-help', () => queryContent(i18n.locale.value, "help", "advanced").findOne())

</script>