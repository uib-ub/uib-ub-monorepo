<template>
<div>
        <ContentRenderer :value="data">
          <ContentRendererMarkdown :value="data" :components="{h1: 'h2', h2: 'h3'}"/>
          <template #empty>
            <p>No content found.</p>
          </template>
          
      </ContentRenderer>
      <aside>
      </aside>
</div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
const i18n = useI18n()
import { useRoute } from 'vue-router'
const route = useRoute()


const { data } = await useAsyncData(`subcontent-${i18n.locale.value}/about/${route.params.slug}`, () => queryContent(`${i18n.locale.value}/about/${route.params.slug}`).findOne(),
        {watch: i18n.locale})


useHead({
    title: i18n.t('about') + ": " + data.value.body.children[0].children[0].value
})

</script>