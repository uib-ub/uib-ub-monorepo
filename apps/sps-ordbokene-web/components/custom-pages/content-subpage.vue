<template>
<div>
        <ContentRenderer :value="data">
          <ContentRendererMarkdown :value="data" :components="{h1: 'h2', h2: 'h3'}"/>
          <template #empty>
            <p>No content found.</p>
          </template>
          
      </ContentRenderer>
</div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

const i18n = useI18n()
const route = useRoute()


const { data } = await useAsyncData('subpage-' + route.fullPath, () => queryContent(route.fullPath).findOne(),
        {watch: i18n.locale})


useHead({
    title: i18n.t(route.matched[0].name) + ": " + data.value.body.children[0].children[0].value
})

</script>