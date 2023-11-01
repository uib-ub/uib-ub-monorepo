<template>
  <div class="secondary-page">
      <ContentRenderer :value="intro">
            <ContentRendererMarkdown :value="intro" />
            <template #empty>
              <p>{{$t('content_not_found')}}</p>
            </template>
          </ContentRenderer>
  
      <ContentNavigation v-if="$route.name != 'contact'" v-slot="{ navigation }" :query="sections" >
          <template v-for="loc in navigation" :key="loc._path" >
            <nav v-if="loc.children[0].children" class="mt-8">
            <ul class="w-full !pl-0">
            <li class="list-none text-left w-full content-linkt-item" v-for="subpage in loc.children[0].children.slice(1, loc.children[0].children.length) " :key="subpage._path">
              <NuxtLink class="w-full link-header !no-underline flex justify-between hover:bg-canvas-darken hover:shadow-inner duration-100 px-5 pt-3 pb-4" :to="subpage._path">{{subpage.title}} <Icon class="self-end text-gray-700" name="bi:chevron-right"/></NuxtLink>
            </li>
            </ul>
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

const { data: intro } = await useAsyncData('content-accordion', () => queryContent(i18n.locale.value, route.name).findOne())
const sections =  queryContent(i18n.locale.value, route.name)

useHead({
    title: intro.value.title,
    meta: [
      {property: 'og:title', content: intro.value.title },
      {name: 'twitter:title', content: intro.value.title },
      {name: 'description', content: intro.value.description },
      {name: 'twitter:description', content: intro.value.description },
      {property: 'og:description', content: intro.value.description }
    ]
})

</script>


<style scoped>

.content-linkt-item:not(:last-child) {
          @apply !border-b border-solid border-gray-100;
          
      }
</style>