<template>
<div>
    <ContentRenderer :value="intro">
          <ContentRendererMarkdown :value="intro" :components="{h1: 'h2'}" />
          <template #empty>
            <p>No content found.</p>
          </template>
        </ContentRenderer>

    <ContentNavigation v-if="$route.name != 'contact'" v-slot="{ navigation }" :query="sections" >
        <template v-for="loc in navigation" :key="loc._path" >
          <nav v-if="loc.children[0].children" class="mt-8">
          <ol  class="w-full">
          <li class=" text-left w-full content-linkt-item" v-for="subpage in loc.children[0].children.slice(1, loc.children[0].children.length) " :key="subpage._path">
            <NuxtLink class="w-full link-header !border-none flex justify-between hover:bg-gray-100 px-5 pt-3 pb-4" :to="subpage._path">{{subpage.title}} <Icon class="self-end text-gray-700" name="bi:chevron-right"/></NuxtLink>
          </li>
          </ol>
          </nav>
        </template>
    </ContentNavigation>
</div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
const i18n = useI18n()
import { useRoute } from 'vue-router'
const route = useRoute()

const { data: intro } = await useAsyncData('intro_' + i18n.locale.value, () => queryContent(i18n.locale.value, route.name).findOne())
const { data: sections } = await useAsyncData('sections_' + i18n.locale.value, () => queryContent(i18n.locale.value, route.name))

useHead({
    title: i18n.t(route.name)
})

</script>


<style scoped>

.content-linkt-item:not(:last-child) {
          @apply !border-b border-solid border-gray-100;
          
      }
</style>