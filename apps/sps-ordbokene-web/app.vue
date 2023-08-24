<template>
  <a ref="skip_link" class="bg-tertiary-darken1 text-center z-1000 text-anchor sr-only text-xl font-semibold underline w-full  !focus-within:p-2 focus:not-sr-only focus:absolute focus:min-w-screen" href="#main"> Til innhold</a>
  <Header/>
<div class="ord-container back-to-search justify-start my-2" v-if="['settings', 'about', 'help', 'contact'].includes($route.name)">
  <NuxtLink v-if="store.searchUrl" :to="store.searchUrl"> <Icon name="bi:arrow-left" size="1.25em" class="mb-1 mr-1 text-primary"/>{{$t('notifications.back')}}</NuxtLink>
<NuxtLink v-else to="/"><Icon name="bi:arrow-left" size="1.25em" class="mb-1 mr-1 text-primary"/>{{$t('home')}}</NuxtLink>
</div>
    <NuxtPage @click="menu_expanded=false"
              v-bind:class="{'welcome': route.name == 'welcome'}"/>
<Footer/>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useStore } from '~/stores/searchStore'
import { useRoute } from 'vue-router'
import Settings from './pages/settings.vue'
import { useSettingsStore } from './stores/settingsStore'
const store = useStore()
const settings = useSettingsStore()
const route = useRoute()

const input_element = useState('input_element')
const announcement = useState('announcement')
const skip_link = ref()
const keyboard_navigation = ref(false)


const baseUrl = useRequestURL().protocol+'//'+useRequestURL().host +"/"

useHead({
    titleTemplate: (titleChunk) => {
      return titleChunk ? `${titleChunk} - ordbøkene.no` : 'ordbøkene.no';
    },
    meta: [
      {name:"twitter:title" , content:"Ordbøkene.no - Bokmålsordboka og Nynorskordboka"},
      {name:"twitter:image" , content:"logo.png"},
      {name:"twitter:description" , content:"Bokmålsordboka og Nynorskordboka viser skrivemåte og bøying i tråd med norsk rettskriving. Språkrådet og Universitetet i Bergen står bak ordbøkene."},
      {property:"og:title" , content:"Ordbøkene.no - Bokmålsordboka og Nynorskordboka"},
      {property:"og:type" , content:"website"},
      {property:'og:site_name' , content:"ordbokene.no"},
      {property:'og:image' , content: baseUrl + "logo.png"},
      {property:"og:image:width" , content:"256px"},
      {property:"og:image:height" , content:"256px"},
      {property:"og:description" , content:"Bokmålsordboka og Nynorskordboka viser skrivemåte og bøying i tråd med norsk rettskriving. Språkrådet og Universitetet i Bergen står bak ordbøkene."},
      {name:"og:description" , content:"Bokmålsordboka og Nynorskordboka viser skrivemåte og bøying i tråd med norsk rettskriving. Språkrådet og Universitetet i Bergen står bak ordbøkene."}
      ]
})



// Global event listeners
if (process.client) {
  document.addEventListener('click', () => {
  store.show_autocomplete = false
  })



  // Handle mouse vs keyboard navigation
  document.addEventListener('mouseup', (event) => {
      keyboard_navigation.value = false;
  })

  document.addEventListener('keyup', (event) => {
    if (event.key == "Tab") {
      keyboard_navigation.value = true
    }
  })


}

const nuxtApp = useNuxtApp()

nuxtApp.hook("page:finish", () => {

  if (settings.autoSelect || route.name == "welcome") {
    input_element.value.select()
  }
  // Handle focus in one place
/*
   window.scrollTo(0, 0)
   if (input_element.value) {
    if (!settings.autoSelect && store.view != 'article') {
      if (announcement.value) {
        announcement.focus()
      }
    }
    else {
      input_element.value.select()
    }

   }
   else {
    
    if (keyboard_navigation.value) {
      skip_link.value.focus()


    }


   }
   */

})


</script>

