<template>
<div>
    <ContentRenderer :value="data">
          <ContentRendererMarkdown :value="data" :components="{h1: 'h2'}" />
          <template #empty>
            <p>No content found.</p>
          </template>
        </ContentRenderer>
</div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
const i18n = useI18n()
import { useRoute } from 'vue-router'
const route = useRoute()

const { data } = await useAsyncData(route.fullPath, async () => await queryContent(i18n.locale.value, route.name).findOne(), {watch: i18n.locale});

useHead({
    title: i18n.t(route.name)
})

</script>