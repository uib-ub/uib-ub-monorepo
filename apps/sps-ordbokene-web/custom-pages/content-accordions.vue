<template>
<div>
    <ContentRenderer :value="data.intro">
          <ContentRendererMarkdown :value="data.intro" :components="{h1: 'h2'}" />
          <template #empty>
            <p>No content found.</p>
          </template>
        </ContentRenderer>
    <ContentRenderer v-for="(section, index) in data.sections" :key="index" :value="section">
          <Collapsible :id="section._path.slice(section._path.lastIndexOf('/') + 1)" is="h3" :header="section.body.children[0].children[0].value">
          <ContentRendererMarkdown :value="{...section, body: {...section.body, children: section.body.children.slice(1)}}" :components="{h2: 'h3'}"/>
          </Collapsible>
          
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


const { data } = await useAsyncData('content-' + i18n.locale.value + route.fullPath, async () => {
  return {
    intro: await queryContent(i18n.locale.value, route.name).findOne(),
    sections: await queryContent(i18n.locale.value, route.name).skip(1).find()
  };
}, {watch: i18n.locale});


useHead({
    title: i18n.t(route.name)
})

</script>