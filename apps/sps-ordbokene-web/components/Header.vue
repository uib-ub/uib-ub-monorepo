<template>
<header class="bg-primary pl-3 pr-0 lg:px-5 py-1 flex flex-col lg:flex-row content-center text-white shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px]">
      <div class="flex flex-row content-center w-full lg:w-auto">
  <NuxtLink class="navbar-brand" :to="'/'+ i18n.locale.value" :aria-current="($route.name == 'welcome' || $route.name == 'index') && 'page'" @click="store.$reset()">
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
          <NuxtLink @click="menu_expanded=false" class="nav-link" :aria-current="$route.name == 'help' && 'page'" :to="`/${$i18n.locale}/help`">{{$t('help')}}</NuxtLink>
        </li>

        <li class="nav-item">
          <NuxtLink @click="menu_expanded=false" class="nav-link" :aria-current="$route.name == 'about' && 'page'" :to="`/${$i18n.locale}/about`">{{$t('about')}}</NuxtLink>
        </li>
                <li class="nav-item">
          <NuxtLink @click="menu_expanded=false" class="nav-link"  :aria-current="$route.name == 'settings' && 'page'" :to="`/${$i18n.locale}/settings`">{{$t('settings.title')}}</NuxtLink>
        </li>
                <li class="nav-item">
          <NuxtLink @click="menu_expanded=false" class="nav-link" :aria-current="$route.name == 'contact' && 'page'" :to="`/${$i18n.locale}/contact`">{{$t('contact')}}</NuxtLink>
        </li>

      </ul>
    </nav>
    

      <div class="relative mb-4 lg:mb-0 lg:ml-4 mt-1" v-if="false && $i18n.locale != 'eng'">
          <Icon name="emojione-monotone:flag-for-united-kingdom" size="1.25em" class="mr-2"/>
          <NuxtLink lang="en" :to="localizeUrl($route.fullPath, 'eng')" @click="change_lang('eng')">English</NuxtLink>
      </div>
      <div class="relative mb-4 lg:mb-0 lg:ml-4 mt-1" v-if="false && $i18n.locale != 'nno' && $i18n.locale != 'nob'">
          <Icon name="emojione-monotone:flag-for-norway" size="1.25em" class="mr-2"/>
          <NuxtLink lang="no" :to="localizeUrl($route.fullPath, new Date().getDate() % 2 ? 'nno' : 'nob')" @click="change_lang(new Date().getDate() % 2 ? 'nno' : 'nob')">Norsk</NuxtLink>
      </div>



      <div class="lg:flex lg:ml-auto  pl-8 mr-1 mt-2 lg:mt-0" @blur="locale_menu_expanded=false" @keydown="escape_menu">
        <button id="locale_button" aria-controls="locale_select" @click.prevent="locale_menu_expanded = true">
          <Icon name="bi:globe" size="1.25em"/><Icon :name="locale_menu_expanded? 'bi:chevron-up' : 'bi:chevron-down'" size="1.25em" class="ml-2"/>
        </button>
        <div class="relative" v-bind:class="{hidden: !locale_menu_expanded}">
        <nav id="locale_select" :aria-label="$t('settings.locale.title')" class="absolute right-0 top-[150%] bg-secondary p-4 border-1 border-primary rounded">
          <ul class="flex flex-col gap-3">
            <li>
              <NuxtLink lang="nb" :to="localizeUrl($route.fullPath, 'eng')" @click="change_lang('nob')"><Icon name="emojione-monotone:flag-for-norway" size="1.25em" class="mr-2"/> Bokmål</NuxtLink>
            </li>
            <li>
              <NuxtLink lang="nn" :to="localizeUrl($route.fullPath, 'nno')" @click="change_lang('nno')"><Icon name="emojione-monotone:flag-for-norway" size="1.25em" class="mr-2"/> Nynorsk</NuxtLink>
            </li>
            <li>
              <NuxtLink lang="en" :to="localizeUrl($route.fullPath, 'eng')" @click="change_lang('eng')"><Icon name="emojione-monotone:flag-for-united-kingdom" size="1.25em" class="mr-2"/> English</NuxtLink>
            </li>
            <li>
              <NuxtLink lang="uk" :to="localizeUrl($route.fullPath, 'ukr')" @click="change_lang('ukr')"><Icon name="emojione-monotone:flag-for-ukraine" size="1.25em" class="mr-2"/> українська</NuxtLink>
            </li>
          </ul>
        </nav>
        </div>
      </div>
      
    </div>
    
  </header>

</template>


<script setup>
import { useI18n } from 'vue-i18n'
import { useSearchStore } from '~/stores/searchStore'
import { useRoute } from 'vue-router'
const store = useSearchStore()
const route = useRoute()
const i18n = useI18n()
const menu_expanded = ref(false)
const locale_cookie = useCookie('currentLocale')
const locale_menu_expanded = ref(false)

const escape_menu = (event) => {
  
}

if (process.client) {
  document.addEventListener('keyup', (e) => {
    if (e.key == "Escape" || e.key == "Esc") {
    menu_expanded.value = !menu_expanded.value
    locale_menu_expanded.value = false
  }
})
}

if (process.client) {
  document.addEventListener('click', (e) => {
    console.log(e)
    if (false && e.target.id != 'locale_button') {
      locale_menu_expanded.value = !locale_menu_expanded.value
    }
    //menu_expanded.value = false
    
  
})
}

const change_lang = (lang) => {
  i18n.locale.value = lang
  locale_cookie.value = lang
  locale_menu_expanded.value = false
  return navigateTo(localizeUrl(route.fullPath, lang))
}

</script>

<style scoped>

nav #locale-select {
  /* letter-spacing: .1rem; */
  @apply cursor-pointer text-base tracking-widest;
}
nav .nav-link {
  font-variant-caps: all-small-caps;
  @apply pt-2 list-none tracking-widest text-xl;
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
      @apply flex;
  }
}


</style>
