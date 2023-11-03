<template>
<header class="bg-primary pl-6 lg:pr-6 flex flex-col lg:flex-row content-center text-white shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px]">
  <div class="flex">
  <div class="flex flex-grow py-1 items-center md:py-3 flex-auto !box-content">
  <NuxtLink :to="'/'+ i18n.locale.value" :aria-current="($route.name == 'welcome' || $route.name == 'index') && 'page'" @click="store.$reset()">
      <div> <span class="text-2xl xl:text-3xl logo-text">ordbøkene.no<span class="sr-only">, {{$t('home')}}</span></span>
      <div class="text-xs xl:text-sm sr-only sm:not-sr-only">{{$t("sub_title")}}</div>
    </div>
  </NuxtLink>
  </div>


    <div class="lg:hidden flex items-center flex-auto flex-grow-0">
      <button  type="button"
                class="text-center text-lg border-x-2 border-primary-lighten p-3"
                aria-haspopup="true" 
                :aria-controls="locale_menu && locale_menu.overlayVisible ? 'locale_menu' : null"
                @click="locale_menu.toggle">
        <span class="relative">
        <span aria-hidden="true" class="absolute text-xs right-2 top-3 bg-primary rounded px-1 select-none">{{locale2lang[$i18n.locale].toUpperCase()}}</span><Icon name="bi:globe" size="1.5em"/>
        <span class="sr-only">
          <span lang="no">Nettsidespråk</span>
          <span v-for="({button, lang}) in localeConfig.filter(item => item.button)" :key="lang" :lang="lang" class="">{{button}}</span>
        </span>
        </span>
      </button>
   

        <button type="button"
                class="flex text-center items-center text-lg p-3"
                :aria-expanded="menu_expanded"
                :aria-controls="menu_expanded? 'main_menu' : null"
                @click="menu_expanded = !menu_expanded">
          <span class="sr-only sm:inline sm:not-sr-only">{{$t('menu')}}</span><Icon :name="menu_expanded && false ? 'bi:x-lg' : 'bi:list'" size="2rem" class="sm:ml-2"/>
        </button>
      </div>

      </div>
    <div id="main_menu" class="lg:flex lg:ml-auto nav-buttons flex-wrap lg:flex-row content-center text-center"  v-bind:class="{hidden: !menu_expanded}">
      <nav class="lg:mr-4 self-center" :aria-label="$t('label.nav')">
      <ul class="flex flex-col lg:flex-row gap-8 lg:gap-6 lg:space-x-3 xl:space-x-8 content-center my-6 lg:my-0 text-lg" >
        <!-- <li class="nav-item invisible lg:visible">
          <span class="nav-link" v-tooltip.right="{ value: `<h4 class='bg-black text-canvas-darken p-4 text-3xl'>${$t('font-size.description')}</h4>`, escape: true}" >{{$t('font-size.title')}}</span>
        </li> -->
        <li class="nav-item">
          <NuxtLink class="nav-link" :aria-current="$route.name == 'help' && 'page'" :to="`/${$i18n.locale}/help`">{{$t('help')}}</NuxtLink>
        </li>

        <li class="nav-item">
          <NuxtLink class="nav-link" :aria-current="$route.name == 'about' && 'page'" :to="`/${$i18n.locale}/about`">{{$t('about')}}</NuxtLink>
        </li>
                <li class="nav-item">
          <NuxtLink class="nav-link"  :aria-current="$route.name == 'settings' && 'page'" :to="`/${$i18n.locale}/settings`">{{$t('settings.title')}}</NuxtLink>
        </li>
                <li class="nav-item">
          <NuxtLink class="nav-link" :aria-current="$route.name == 'contact' && 'page'" :to="`/${$i18n.locale}/contact`">{{$t('contact')}}</NuxtLink>
        </li>

      </ul>
    </nav>
    <button  type="button" class="ml-6 hidden lg:flex" @click="locale_menu.toggle" aria-haspopup="true" :aria-controls="locale_menu && locale_menu.overlayVisible ? 'locale_menu' : null">
        <span class="relative">
        <span aria-hidden="true" class="absolute text-xs right-2 top-3 bg-primary rounded px-1 select-none">{{locale2lang[$i18n.locale].toUpperCase()}}</span><Icon name="bi:globe" size="1.5em"/>
        <span class="sr-only">
          <span lang="no">Nettsidespråk</span>
          <span v-for="({button, lang}) in localeConfig.filter(item => item.button)" :key="lang" :lang="lang" class="">{{button}}</span>
        </span>
        </span>
      </button> 
      <div class="flex self-center justify-end pr-4 pb-4 lg:p-0">
      <Menu id="locale_menu" ref="locale_menu" :model="locales" :popup="true"
      :pt="{
        root: '',
        menu: 'border-2 border-primary-lighten bg-primary-lighten text-white',
        menuitem: 'hover:bg-primary-lighten2',
        action: ({ props, state, context }) => ({
            class: (context.focused ? 'bg-primary' : '' ) + ' p-4 px-4 w-[200px] hover:bg-primary-lighten2'
        })
        }">
            <template #item="{ item, props }">
                  <a      :href="item.route"
                          class="gap-4"
                          :aria-current="$i18n.locale==item.locale"
                          :lang="item.lang"
                          v-bind="props.action"
                          @click.prevent="change_locale(item.locale)">
                        <span aria-hidden="true" class="bg-primary rounded px-2 select-none">{{item.lang.toUpperCase()}}</span><span>{{item.label}}</span>
                        <span><Icon v-if="$i18n.locale==item.locale" name="bi:check2" size="1.5rem"/></span>
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
const locale_cookie = useCookie('currentLocale', {maxAge: 31536000})

const locale_menu = ref();


  watch(route, value => {
    menu_expanded.value = false
  }, {deep: true, immediate: true})

const change_locale = (lang) => {
  i18n.locale.value = lang
  locale_cookie.value = lang
  return navigateTo(localizeUrl(route.fullPath, lang))
}

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


.logo-text {
    font-family: Inria Serif;
    @apply font-bold;
}

nav .nav-link {
  @apply pt-2 list-none;
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
