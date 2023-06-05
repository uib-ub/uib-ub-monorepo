<template>
  <a ref="skip_link" class="bg-tertiary-darken1 text-center z-1000 text-anchor sr-only text-xl font-semibold underline w-full  !focus-within:p-2 focus:not-sr-only focus:absolute focus:min-w-screen" href="#main"> Til innhold</a>
  <Header/>
<div class="ord-container back-to-search justify-start my-2" v-if="['article', 'settings', 'about', 'help', 'contact'].includes($route.name)">
  <NuxtLink v-if="store.searchUrl" :to="store.searchUrl"> <Icon name="bi:arrow-left" size="1.25em" class="mb-1 mr-1 text-primary"/>{{$t('notifications.back')}}</NuxtLink>
<NuxtLink v-else to="/"><Icon name="bi:arrow-left" size="1.25em" class="mb-1 mr-1 text-primary"/>{{$t('home')}}</NuxtLink>
</div>
    <NuxtPage @click="menu_expanded=false" 
              v-bind:class="{'welcome': !store.q && (route.name == 'search' || route.name == 'dict')}"/>
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

console.log("CLIENT?",process.client)

useHead({
    titleTemplate: (titleChunk) => {
      return titleChunk ? `${titleChunk} - ordbøkene.no` : 'ordbøkene.no';
    },
    meta: [
      {name:"twitter:title" , content:"Ordbøkene.no - Bokmålsordboka og Nynorskordboka"},
      {name:"twitter:image" , content:"/assets/images/logo.png"},
      {name:"twitter:description" , content:"Bokmålsordboka og Nynorskordboka viser skrivemåte og bøying i tråd med norsk rettskriving. Språkrådet og Universitetet i Bergen står bak ordbøkene."},
      {property:"og:title" , content:"Ordbøkene.no - Bokmålsordboka og Nynorskordboka"},
      {property:"og:type" , content:"website"},
      {property:'og:site_name' , content:"ordbokene.no"},
      {property:'og:image' , content: "/assets/images/logo.png"},
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
  
  if (settings.autoSelect || route.name == "dict") {
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


<style>


#__nuxt {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
}

body {
  overflow-y: scroll;
}


body, html, main {
  height: 100% !important;
}

body {
  @apply bg-tertiary;
}

main {
  flex: 1;
}

.welcome .article {
  box-shadow: none !important;
  border-radius: 0 !important;
  border: none;
  @apply !bg-tertiary-darken1 md:!bg-tertiary md:!border-none md:shadow-none;
}

.welcome .ord-container {
    @apply md:!px-10 xl:!px-40;
}




@media screen(md) {
  .welcome.simple-search {
    background-image: url(assets/images/janko-ferlic-sfL_QOnmy00-unsplash.webp);
    @apply flex-col;
  }
}


.ord-container, .secondary-page {
  @apply md:mx-auto px-2;

  @media screen(md) {
    @apply container;
  }

  
}


h1 {
  font-family: Inria Serif;
  font-weight: bold;

}


.brand-title {
  font-size: 2rem;
  margin-bottom: 0.125rem;
}

.brand-subtitle {
  margin-left: 0.125rem;
  margin-bottom: 0.5rem;
  font-size: 1rem;
}


::selection {
  background-color: theme(colors.secondary.DEFAULT);
  @apply text-white bg-secondary;
}



@media screen(lg) {
    .nav-buttons.hidden {
      display: flex;
  }
}


section a, .secondary-page a  {
  border-bottom: 2px solid;
  @apply border-anchor;
}

.secondary-page {
  @apply bg-white mb-4 p-4 py-8 md:p-12 md:pt-10;
  
}

 .secondary-page ul {
    list-style: disc;
    margin-block-start: 1em;
    margin-block-end: 1em;
    padding-inline-start: 40px;
  }


  .secondary-page h2 {
    font-family: Inria Serif;
    @apply text-primary;
    font-weight: bold;
    font-size: 2rem;
  }

  .secondary-page h4 {
    @apply text-primary;
    font-weight: 600;
    font-size: 1.125rem;
    padding-top: 1rem;
  }

 .secondary-page p {
    padding-bottom: 1rem;
  }

.dict-view h3 {
    font-size: calc(1.3rem + .6vw);
  }


.secondary-page h3 button, .secondary-page h3, .dict-view h2 {
    @apply text-primary;
    font-weight: 600;
    font-variant: all-small-caps;
    font-size: 1.75rem;
  }

.secondary-page h3 button {
  font-size: 1.5rem;
}




#advanced-info h2 {
  font-family: Inria Serif;
  font-variant: normal;
  @apply text-primary;
  font-weight: bold;
}


.srlogo{
  width: 156px;
  height: 28px;
}
.uiblogo{
  height: 80px;
  width: 80px
}

.callout {
  border-left: solid 4px theme("colors.primary.DEFAULT");

   margin-top: 1rem;
   margin-bottom: 1rem;
   padding: 1rem;
   @apply bg-tertiary-darken1;

}

.callout i {
  background-color: theme("colors.primary.DEFAULT");
  padding-right: 0.5rem;
  font-size: 1.25rem;
}

.article h5 {
  @apply text-primary;
  font-weight: 600;
  font-size: 1rem;
  padding-top: 1rem;
}

.article .level1>ol {
  padding-left: 1.25rem;
}

.article li {
  margin-bottom: 0.25rem;
  margin-top: 0.25rem;
}

.article ul {
  margin-bottom: 1rem;
}

.article ol {
  margin-bottom: 2rem;
}


.article section {
  padding-top: .5rem;
  padding-bottom: .5rem;
}


.article section.etymology > h4, section.pronunciation > h4 {
  display: inline;
}

.article section.etymology ul, section.pronunciation ul, section.etymology li, section.pronunciation li {
  display: inline;
}

.article section.etymology li:not(:first-child):not(:last-child):before, section.pronunciation li:not(:first-child):not(:last-child):before {
  content: ", ";
}

.article section.etymology li:not(:first-child):last-child:before, section.pronunciation li:not(:first-child):last-child:before {
  content: "; ";
  font-size: smaller;
}



li.level1.definition {
  list-style: upper-alpha;
}


li.level3.definition {
  /* Norsk ordbok skal ha "lower.alpha" her */
  list-style: disc;
}

li.sub_article > ul {
  padding-left: 0px;
}

li::marker {
  @apply text-primary;
  font-weight: bold;
}

li.level2>div {
  padding-left: 0.5rem;
}

ol.sub_definitions {
  padding-left: 1.25rem;
}


.article-view .article, .secondary-page {
    border: solid 1px theme('colors.gray.200') !important;
    box-shadow: 2px 2px 0px theme('colors.gray.200') !important;

}


.btn {
  border-radius: 2rem;
  padding-right: 1rem;
  padding-left: 1rem;
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  border-width: 1px;
  font-weight: 600;
}

.btn:hover {
  background-color: theme(colors.gray.50)
}


.btn[aria-expanded=true] {
    @apply bg-tertiary-darken1 hover:bg-tertiary-darken2;
    box-shadow: 2px 2px 0px theme('colors.gray.500');
    border: none;

}


.btn-borderless {
  @apply border-none;
}

.rounded-4xl {
  border-radius: 2rem;
}

@-moz-document url-prefix() {
  /* Styles for Firefox only */
  *:focus {
    outline: 3px solid theme("colors.secondary.DEFAULT");
  }
}



</style>
