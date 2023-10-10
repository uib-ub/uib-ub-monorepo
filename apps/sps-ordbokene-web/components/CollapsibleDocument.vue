<template>
            <ContentRenderer :value="data">
          <ContentRendererMarkdown :value="{...data, body: {...data.body, children: data.body.children.slice(1)}}" :components="{h2: 'h3'}"/>
          <template #empty>
            <p>No content found.</p>
          </template>
          
      </ContentRenderer>

</template>


<script setup>

import { useI18n } from 'vue-i18n'
const i18n = useI18n()
import { useRoute } from 'vue-router'
const route = useRoute()

const { data } = await useAsyncData('subpage-' + route.fullPath, () => queryContent(route.fullPath).findOne(),
        {watch: i18n.locale})

</script>