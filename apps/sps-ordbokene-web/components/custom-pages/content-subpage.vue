<template>
<div class="secondary-page overflow-auto">
        <ContentRenderer :value="data">
          <ContentRendererMarkdown :value="data" :components="{h1: 'h2', h2: 'h3'}"/>
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


const { data } = await useAsyncData('subpage-data', () => {
  return queryContent(route.params.locale ? route.fullPath : '/' + i18n.locale.value + route.fullPath ).findOne()})


useHead({
    title: data.value.title,
    meta: [
      {property: 'og:title', content:  data.value.title},
      {name: 'twitter:title', content:  data.value.title },
      {name: 'description', content: data.value.description },
      {name: 'twitter:description', content: data.value.description },
      {property: 'og:description', content: data.value.description }
    ]
})

</script>