<template>
  <footer class=" bg-primary text-white">
    <div class="ord-container p-3 pt-10 md:pt-4">
      <div class="flex flex-col xl:flex-row items-center xl:items-start">
        <div class="flex flex-col md:flex-row m-1 lg:mr-4 items-center">
          <img class="w-[156px] h-[28px] m-1 mr-6" src="../assets/images/Sprakradet_logo_neg.png" alt="Språkrådet, logo" />
          <img class="w-[80px] h-[80px]mx-4 my-4 mr-2 lg:my-0 " src="../assets/images/uib-logo.svg" alt="Universitetet i Bergen, logo" />
        </div>
        <span></span>
        <div class="p-4 md:px-16 text-center xl:text-left">
          <em>Bokmålsordboka</em>{{$t('and')}}<em>Nynorskordboka</em>{{$t('footer_description')}}
        </div>
      </div>
      <nav :aria-label="$t('navigation.site')" class="flex justify-center items-center site-nav">
        <ul class="flex flex-col md:flex-row gap-3 mt-5 pt-2 md:pt-0 md:mt-2 lg:mt-0 justify-center md:text-lg text-center md:gap-10">
        <li>
            <NuxtLink :aria-current="$route.name == 'welcome' && 'page'" class="nav-link" :to="`/${$i18n.locale}`" @click="store.$reset()">{{$t('home')}}</NuxtLink>
        </li>
        <li>
            <NuxtLink :aria-current="$route.name == 'help' && 'page'" class="nav-link" :to="`/${$i18n.locale}/help`">{{$t('help')}}</NuxtLink>
          </li>
        <li>
            <NuxtLink :aria-current="$route.name == 'about' && 'page'" class="nav-link" :to="`/${$i18n.locale}/about`">{{$t('about')}}</NuxtLink>
          </li>
        <li>
            <NuxtLink :aria-current="$route.name == 'settings' && 'page'" class="nav-link" :to="`/${$i18n.locale}/settings`">{{$t('settings.title')}}</NuxtLink>
          </li>
        <li>
            <NuxtLink :aria-current="$route.name == 'contact' && 'page'" class="nav-link" :to="`/${$i18n.locale}/contact`">{{$t('contact')}}</NuxtLink>
          </li>
      </ul>
    </nav>

    <nav :aria-label="$t('settings.locale.title')" class="flex justify-center items-center !text-xs">
        <ul class="flex flex-col md:flex-row gap-3 mt-6 pt-2 md:pt-0 justify-center md:text-lg text-center md:gap-10">
        <li  v-if="$i18n.locale != 'nob'">
          <Icon name="emojione-monotone:flag-for-norway" size="1.25em" class="mr-2"/>
          <NuxtLink lang="nb" :to="localizeUrl($route.fullPath, 'eng')" @click="change_lang('nob')">Bokmål</NuxtLink>
        </li>
        <li  v-if="$i18n.locale != 'nno'">
          <Icon name="emojione-monotone:flag-for-norway" size="1.25em" class="mr-2"/>
          <NuxtLink lang="nn" :to="localizeUrl($route.fullPath, 'nno')" @click="change_lang('nno')">Nynorsk</NuxtLink>
        </li>
        <li  v-if="$i18n.locale != 'eng'">
          <Icon name="emojione-monotone:flag-for-united-kingdom" size="1.25em" class="mr-2"/>
          <NuxtLink lang="en" :to="localizeUrl($route.fullPath, 'eng')" @click="change_lang('eng')">English</NuxtLink>
        </li>
         <li  v-if="$i18n.locale != 'ukr'">
          <Icon name="emojione-monotone:flag-for-ukraine" size="1.25em" class="mr-2"/>
          <NuxtLink lang="uk" :to="localizeUrl($route.fullPath, 'ukr')" @click="change_lang('ukr')">українська</NuxtLink>
        </li>
      </ul>
    </nav>
    
    </div>
    <div class="float-right px-1 text-gray-300" aria-hidden="true">{{$config.public.versionWatermark}}</div>
    
  </footer>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useSearchStore } from '~/stores/searchStore'

const i18n = useI18n()
const route = useRoute()
const store = useSearchStore()

const change_lang = (lang) => {
  i18n.locale.value = lang
  locale_cookie.value = lang
  return navigateTo(localizeUrl(route.fullPath, lang))
}

</script>
  
  <style scoped>
  
  .site-nav {
    font-variant: all-small-caps;
    letter-spacing: 0.1rem;
  
  
  }
  
/* li {
  @apply pb-1;
  list-style-type: none;
} */
nav .nav-link:focus {
  @apply text-white border-white;
  }
  
nav .nav-link:hover {
  border-bottom: solid 0.125rem theme('colors.white');
}
  
nav .nav-link[aria-current='page'] {
  border-bottom: solid 0.125rem theme('colors.secondary.DEFAULT');
}
  
  </style>
