<template>
<div>
    <ContentRenderer :value="data.intro">
          <ContentRendererMarkdown :value="data.intro" :components="{h1: 'h2'}" />
          <template #empty>
            <p>No content found.</p>
          </template>
        </ContentRenderer>

    <input/>
    <ContentNavigation v-if="$route.name != 'contact'" v-slot="{ navigation }" :query="data.sections" >
        <template v-for="loc in navigation" :key="loc._path" >
          <template v-if="loc.children[0].children">
          <div v-for="subpage in loc.children[0].children.slice(1, loc.children[0].children.length) " :key="subpage._path">
          <Collapsible :id="subpage._path.slice(subpage._path.lastIndexOf('/') + 1)" is="h3" :header="subpage.title">
           <CollapsibleDocument :path="subpage._path"/>
          </Collapsible>
          </div>
          </template>
        </template>
    </ContentNavigation>
      
        <!--
    <ContentRenderer v-for="(section, index) in data.sections" :key="index" :value="section">
          <Collapsible :id="section._path.slice(section._path.lastIndexOf('/') + 1)" is="h3" :header="section.body.children[0].children[0].value">
          
          </Collapsible>
          
          <template #empty>
            <p>No content found.</p>
          </template>
          
      </ContentRenderer>-->
</div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
const i18n = useI18n()
import { useRoute } from 'vue-router'
const route = useRoute()


const { data } = await useAsyncData('content-' + route.fullPath, async () => {
  return {
    intro: await queryContent(i18n.locale.value, route.name).findOne(),
    sections: await queryContent(i18n.locale.value, route.name)
  };
}, {watch: i18n.locale});


useHead({
    title: i18n.t(route.name)
})

</script>