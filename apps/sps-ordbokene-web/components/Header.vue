<template>
<header class="bg-primary pl-3 pr-0 lg:px-5 py-1 flex flex-col lg:flex-row content-center text-white shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px]">
      <div class="flex flex-row content-center w-full lg:w-auto">
  <NuxtLink class="navbar-brand" to="/" :aria-current="$route.name == 'welcome' && 'page'">
      <div class="mx-1 md:my-1 lg:my-3 xl:my-4">
      <div><h1 class="text-2xl mt-0.5 mb-0.5">Ordbøkene <span class="sr-only">, {{$t('home')}}</span></h1>
      <p class="hidden xl:block brand-subtitle ml-0.5 mb-1">{{$t("sub_title")}}</p>
      </div>
    </div>
      </NuxtLink>
      <div class="lg:hidden text-lg ml-auto flex align-center">

      <button class="text-lg p-2 px-3 rounded-4xl active:bg-primary-darken focus:bg-primary-darken" 
              @keydown="escape_menu" 
              :aria-expanded="menu_expanded"
              :aria-controls="menu_expanded? 'main_menu' : null"
              @click="menu_expanded = !menu_expanded">
        <div class="sr-only sm:inline sm:not-sr-only">{{$t('menu.title')}}</div><Icon :name="menu_expanded ? 'bi:x-lg' : 'bi:list'" class="sm:ml-2"/>
      </button>
</div>
      </div>
    <div id="main_menu" class="lg:flex lg:ml-auto text-center nav-buttons flex-wrap lg:flex-row content-center lg:ml-auto  mr-1 mt-2 lg:mt-0" :aria-label="$t('label.nav')" v-bind:class="{hidden: !menu_expanded}">
      <nav class="lg:mr-4">
      <ul class="flex flex-col lg:flex-row gap-4 lg:space-x-3 xl:space-x-8 content-center mb-4 lg:mb-0" >
        <li class="nav-item">
          <NuxtLink @click="menu_expanded=false" class="nav-link" :aria-current="$route.name == 'help' && 'page'" to="/help">{{$t('help')}}</NuxtLink>
        </li>

        <li class="nav-item">
          <NuxtLink @click="menu_expanded=false" class="nav-link" :aria-current="$route.name == 'about' && 'page'" to="/about">{{$t('about.title')}}</NuxtLink>
        </li>
                <li class="nav-item">
          <NuxtLink @click="menu_expanded=false" class="nav-link"  :aria-current="$route.name == 'settings' && 'page'" to="/settings">{{$t('settings.title')}}</NuxtLink>
        </li>
                <li class="nav-item">
          <NuxtLink @click="menu_expanded=false" class="nav-link" :aria-current="$route.name == 'contact' && 'page'" to="/contact">{{$t('contact.title')}}</NuxtLink>
        </li>

      </ul>
    </nav>
    <div class="relative mb-4 lg:mb-0 lg:ml-4 mt-1">
          <Icon name="bi:globe2" size="1.25em" class="mr-2"/>
          <label for="locale-select" class="sr-only">{{$t('settings.locale.title')}}</label>
          <select id="locale-select" class="bg-primary text-white focus:outline-none" v-model="i18n.locale.value" @change="update_locale">
            <option class="text-text text-xl bg-canvas shadow-xl border-2" value="eng">English</option>
            <option class="text-text text-xl bg-canvas shadow-xl border-2" value="nob">Bokmål</option>
            <option class="text-text text-xl bg-canvas shadow-xl border-2" value="nno">Nynorsk</option>
          </select> 
      </div>
    </div>
  </header>
    
</template>


<script setup>
import { useI18n } from 'vue-i18n'
import { useStore } from '~/stores/searchStore'
import { useRoute } from 'vue-router'
const store = useStore()
const route = useRoute()
const i18n = useI18n()

const locale_expanded = ref(false)
const menu_expanded = ref(false)
const locale = useCookie('currentLocale')

const escape_menu = (event) => {
  console.log(event.key)
  if (event.key == "Escape" || event.key == "Esc") {
    menu_expanded.value = false
  }
}

useHead({
    htmlAttrs: {
      lang: {nob: 'nb', nno: 'nn', eng: 'en'}[i18n.locale.value]
    },
    titleTemplate: (titleChunk) => {
      return titleChunk ? `${titleChunk} - ordbøkene.no` : 'ordbøkene.no';
    }
})

const update_locale = () => {
  locale_expanded.value = false
  locale.value = i18n.locale.value
  useHead({
    htmlAttrs: {
      lang: {nob: 'nb', nno: 'nn', eng: 'en'}[i18n.locale.value]
    }
})
}

  // const showHoverText = () => {
  //   isHovered.value = true;
  // };

</script>

<style scoped>

nav #locale-select {
  letter-spacing: .1rem;
  font-size: 1rem;
  cursor: pointer;
}
nav .nav-link {
  font-variant-caps: all-small-caps;
  font-size: 1.25rem;
  letter-spacing: .1rem;
  list-style-type: none;
  padding-top: .5rem;
}



nav .nav-link:focus {
  @apply text-white border-white;
}

nav .nav-link:hover {
  border-bottom: solid .125rem theme('colors.white');
}
nav .nav-link[aria-current=page] {
  border-bottom: solid .125rem theme('colors.secondary.DEFAULT');
}

@media screen(lg) {
    .nav-buttons.hidden {
      display: flex;
  }
}


</style>
