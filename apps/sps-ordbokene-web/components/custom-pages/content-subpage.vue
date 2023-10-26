<template>
<div class="secondary-page">
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

console.log("FULLPATH", route.fullPath)
console.log(i18n.locale)

const { data } = await useAsyncData('subpage-' + route.fullPath, () => {
  console.log("FETCHING", route.fullPath)
  return queryContent(route.fullPath).findOne()

} ,
        {watch: i18n.locale})

console.log("DATA", data.value)

useHead({
    title: i18n.t(route.matched[0].name) + ": " + data.value.body.children[0].children[0].value
})

</script>