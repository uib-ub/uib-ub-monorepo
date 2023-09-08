<template>
<main id="main" tabindex="-1" class="secondary-page">
        <ContentRenderer :value="data.intro">
          <ContentRendererMarkdown :value="data.intro" :components="{h1: 'h2'}" />
          <template #empty>
            <p>No content found.</p>
          </template>
        </ContentRenderer>

        <ContentRenderer v-for="(section, index) in data.sections" :key="index" :value="section" :components="{h2: 'h3'}" >
          <Collapsible :id="section._path.slice(section._path.lastIndexOf('/') + 1)" is="h3" :header="section.body.children[0].children[0].value">
          <ContentRendererMarkdown :value="{...section, body: {...section.body, children: section.body.children.slice(1)}}" />
          </Collapsible>
          
          <template #empty>
            <p>No content found.</p>
          </template>
          
        </ContentRenderer>

        {{data.sections}}



</main>
</template>




<script setup>
import { useI18n } from 'vue-i18n'

const i18n = useI18n()

const path = `${i18n.locale.value}/about/`

const { data } = await useAsyncData(`content-${path}`, async () => {
  //let sections = await queryContent(i18n.locale.value, "about").find()
  //const titles = sections.map(item => item.body.children[0])

  
  return {
    intro: await queryContent(i18n.locale.value, "about").findOne(),
    sections: await queryContent(i18n.locale.value, "about").skip(1).find()
  };
});


useHead({
    title: i18n.t('about')
})



const components = {
    h1: "h2",
    h2: "h3",
    h3: "h4",
}
</script>



