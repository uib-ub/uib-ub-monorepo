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
              :aria-expanded="menu_expanded"
              :aria-controls="menu_expanded? 'main_menu' : null"
              @click="menu_expanded = !menu_expanded">
        <div class="sr-only sm:inline sm:not-sr-only">{{$t('menu.title')}}</div><Icon :name="menu_expanded ? 'bi:x-lg' : 'bi:list'" class="sm:ml-2"/>
      </button>
</div>
      </div>
    <div id="main_menu" class="lg:flex lg:ml-auto nav-buttons flex-wrap lg:flex-row content-center text-center lg:ml-auto  mr-1 mt-2 lg:mt-0" :aria-label="$t('label.nav')" v-bind:class="{hidden: !menu_expanded}">
      <nav class="lg:mr-4 self-center">
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
          
      <div class="self-center">
      <button class="ml-8 text-center" type="button" @click="locale_menu.toggle" aria-haspopup="true" aria-controls="locale_menu">
        <div class="relative">
        <div class="absolute text-xs right-2 top-3 bg-primary rounded px-1">{{locale2lang[$i18n.locale].toUpperCase()}}</div> </div><Icon name="bi:globe" size="1.5em"/>
        <div id="locale-label" class="sr-only">
          <div lang="no">Nettsidespråk</div>
          <div v-for="({button, lang}) in localeConfig.filter(item => item.button)" :key="lang" :lang="lang" class="">{{button}}</div>
        </div>
      </button>
      <Menu ref="locale_menu" id="locale_menu" :model="locales" :popup="true"
      :pt="{
        root: 'md:mt-5 xl:mt-9',
        menu: ''
        }">
            <template #item="{ item, props }">
                  <a      :href="item.route"
                          @click.prevent="change_locale(item.locale)"
                          v-bind="props.action"
                          :lang="item.lang">
                        <Icon :name="item.icon" size="1.25em" class="mr-2 text-gray-900"/> {{item.label}} 
                        <Icon v-if="$i18n.locale==item.locale" name="bi:check2" size="1.5em" class="ml-2"/>
                  </a>
            </template>
        </Menu>
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

const change_locale = (lang) => {
  i18n.locale.value = lang
  locale_cookie.value = lang
  return navigateTo(localizeUrl(route.fullPath, lang))
}

const locale_menu = ref();
const locales = ref(localeConfig.map(item => { return {route: localizeUrl(route.fullPath, item.locale), 
                                                  command: () => {change_locale(item.locale)}, 
                                                  ...item}}));


if (process.client) {
  document.addEventListener('keyup', (e) => {
    if (e.key == "Escape" || e.key == "Esc") {
      menu_expanded.value = !menu_expanded.value
  }
})
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
