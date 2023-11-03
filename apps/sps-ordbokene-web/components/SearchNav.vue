<template>
  <div class="nav-container px-2">
    <nav :aria-label="$t('label.dict_nav')" class="md:flex inline-block md:justify-center !my-2 box-content px-2 md:pr-0">
  <ul class="flex gap-2 md:gap-3 mr-2">
  <li>
    <NuxtLink class="inline-block"
              :aria-current="store.dict =='bm,nn' ? 'true' : 'false'"
              :to="dict_link('bm,nn')"
              @click="dict_click('bm,nn')">{{$t('dicts_short.bm,nn')}}</NuxtLink>
  </li>
  <li>
    <NuxtLink  :aria-current="store.dict =='bm' ? 'true' : 'false'"
              :to="dict_link('bm')"
              @click="dict_click('bm')">{{$t('dicts_short.bm')}}</NuxtLink>
  </li>
  <li>
    <NuxtLink :aria-current="store.dict =='nn' ? 'true' : 'false'"
              :to="dict_link('nn')"
              @click="dict_click('nn')">{{$t('dicts_short.nn')}}</NuxtLink>
  </li>
  <li>
    <NuxtLink :aria-current="advanced ? 'true' : 'false'"
              :to="advanced_link"
              class="!pr-1">{{$t('advanced')}} <Icon class="text-primary" name="bi:arrow-right-short" size="1.5em"/></NuxtLink>
  </li>
</ul>
</nav>
</div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useSearchStore } from '~/stores/searchStore'

const i18n = useI18n()
const store = useSearchStore()
const route = useRoute()
const props = defineProps({
    advanced: Boolean
})

const dict_click = (dict) => {
      store.dict = dict
      store.lemmas.bm = new Set()
      store.lemmas.nn = new Set()
      if (store.q !== store.input) {
        store.input = route.query.orig || store.q
      }
    }
    
    
    const advanced_link = computed(() => {
       if (store.q) {
        return  `/${i18n.locale.value}/search?q=${store.q}&dict=${store.dict || 'bm,nn'}&scope=${store.scope || 'ei'}`
       }
       else {
        return `/${i18n.locale.value}/search`
       }
       
      
      
    })
    
    const dict_link = ((dict) => {
      let url = `/${i18n.locale.value}/${dict}`
      if (route.query.orig) {
        url += "/" + route.query.orig
      }
      else if (store.q) {
        url += "/" + store.q
      }
        return url
    })

</script>

<style scoped>

.nav-container {
  scrollbar-width: none;
  @apply overflow-x-auto whitespace-nowrap;
}

button {
  @apply font-semibold;
}

ul {
  @apply text-lg;
}

a {
@apply flex py-1 px-4 md:text-sm text-gray-900 bg-tertiary border-gray-700 border md:border-none whitespace-nowrap;
border-radius: 2rem;

}

a[aria-current=true] {
  @apply bg-gray-700 border-gray-700 text-white;
}

  /* Hide scrollbar for Chrome, Safari and Opera */
.nav-container::-webkit-scrollbar {
  @apply hidden;
}



</style>
