<template>
<div class="secondary-page">
    <ContentRenderer :value="contact">
          <ContentRendererMarkdown :value="contact" :components="{h1: 'h2'}" />
          <template #empty>
            <p>{{$t('content_not_found')}}</p>
          </template>
        </ContentRenderer>
</div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
const i18n = useI18n()
import { useRoute } from 'vue-router'
const route = useRoute()
const { data: contact } = await useAsyncData('contact_' + i18n.locale.value, () => queryContent(i18n.locale.value, "contact").findOne())


useHead({
    title: i18n.t("contact")
})

</script>