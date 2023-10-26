<template>
<header class="bg-primary pl-3 pr-0 lg:px-5 py-1 flex flex-col lg:flex-row content-center text-white shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px]">
      <div class="flex flex-row content-center items-center w-full lg:w-auto">
  <NuxtLink :to="'/'+ i18n.locale.value" :aria-current="($route.name == 'welcome' || $route.name == 'index') && 'page'" @click="store.$reset()">
      <div class="mx-1 my-1 md:my-2 mt-0 xl:my-4">
      <div><h1 class="text-md xl:text-2xl">ordbøkene.no<span class="sr-only">, {{$t('home')}}</span></h1>
      <div class="text-xs xl:text-sm sr-only sm:not-sr-only">{{$t("sub_title")}}</div>
      </div>
    </div>
      </NuxtLink>
      <div class="lg:hidden text-lg ml-auto flex align-center">

      <button type="button"
              class="text-lg pb-2 pt-1 px-3 sm:px-4 rounded-4xl active:bg-primary-darken focus:bg-primary-darken"
              :aria-expanded="menu_expanded"
              :aria-controls="menu_expanded? 'main_menu' : null"
              @click="menu_expanded = !menu_expanded">
        <span class="sr-only sm:inline sm:not-sr-only">{{$t('menu')}}</span><Icon :name="menu_expanded ? 'bi:x-lg' : 'bi:list'" class="sm:ml-2"/>
      </button>
</div>
      </div>
    <div id="main_menu" class="lg:flex lg:ml-auto nav-buttons flex-wrap lg:flex-row content-center text-center mr-1 mt-6 lg:mt-0"  v-bind:class="{hidden: !menu_expanded}">
      <nav class="lg:mr-4 self-center" :aria-label="$t('label.nav')">
      <ul class="flex flex-col lg:flex-row gap-4 lg:space-x-3 xl:space-x-8 content-center mb-4 lg:mb-0" >
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
          
      <div class="flex self-center justify-end lg:justify-center pr-4 pb-4 lg:p-0">
      <button  type="button" class="ml-8" @click="locale_menu.toggle" aria-haspopup="true" :aria-controls="locale_menu && locale_menu.overlayVisible ? 'locale_menu' : null">
        <span class="relative">
        <span aria-hidden="true" class="absolute text-xs right-2 top-3 bg-primary rounded px-1 select-none">{{locale2lang[$i18n.locale].toUpperCase()}}</span><Icon name="bi:globe" size="1.5em"/>
        <span id="locale-label" class="sr-only">
          <span lang="no">Nettsidespråk</span>
          <span v-for="({button, lang}) in localeConfig.filter(item => item.button)" :key="lang" :lang="lang" class="">{{button}}</span>
        </span>
        </span>
      </button>
      <Menu ref="locale_menu" id="locale_menu" :model="locales" :popup="true"
      :pt="{
        root: '',
        menu: 'border-2 border-primary-lighten bg-primary-lighten text-white mt-5 md:mt-5 xl:mt-9',
        menuitem: 'hover:bg-primary-lighten2',
        action: ({ props, state, context }) => ({
            class: (context.focused ? 'bg-primary' : '' ) + ' p-4 px-4 w-[200px] hover:bg-primary-lighten2'
        })
        }">
            <template #item="{ item, props }">
                  <a      :href="item.route"
                          class="gap-4"
                          :aria-current="$i18n.locale==item.locale"
                          @click.prevent="change_locale(item.locale)"
                          v-bind="props.action"
                          :lang="item.lang">
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
