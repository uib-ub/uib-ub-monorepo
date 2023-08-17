<template>
  <div class="nav-container px-2">
    <nav :aria-label="$t('label.dict_nav')" class="md:flex md:justify-center !my-1">
  <ul id="searchNavContent" class="flex gap-2 md:gap-3">
  <li>
    <NuxtLink class="inline-block"
              :aria-current="route.params.dict =='bm,nn' ? 'true' : 'false'"
              @click="dict_click('bm,nn')"
              :to="dict_link('bm,nn')"><span class="max-sm:sr-only">{{$t('dicts.bm,nn')}}</span><span aria-hidden="true" class="block sm:hidden">{{$t('dicts_short.bm,nn')}}</span></NuxtLink>
  </li>
  <li>
    <NuxtLink  :aria-current="route.params.dict =='bm' ? 'true' : 'false'"
              @click="dict_click('bm')"
              :to="dict_link('bm')"><span class="max-sm:sr-only">{{$t('dicts.bm')}}</span><span aria-hidden="true" class="block sm:hidden">{{$t('dicts_short.bm')}}</span></NuxtLink>
  </li>
  <li>
    <NuxtLink :aria-current="route.params.dict =='nn' ? 'true' : 'false'"
              @click="dict_click('nn')"
              :to="dict_link('nn')"><span class="max-sm:sr-only">{{$t('dicts.nn')}}</span><span aria-hidden="true" class="block sm:hidden">{{$t('dicts_short.nn')}}</span></NuxtLink>
  </li>
  <li>
    <NuxtLink :aria-current="advanced ? 'true' : 'false'"
              :to="advanced_link">{{$t('advanced')}} <Icon name="bi:arrow-right" size="1.25em" class="ml-1 md:mt-0.5"/></NuxtLink>
  </li>
</ul>
</nav>
</div>
</template>

<script setup>

import { useStore } from '~/stores/searchStore'
import { useRoute } from 'vue-router'
const store = useStore()
const route = useRoute()
const props = defineProps({
    advanced: Boolean
})

const dict_click = (dict) => {
      store.dict = dict
      store.lemmas.bm = new Set()
      store.lemmas.nn = new Set()
      if (store.q != store.input) {
        store.input = route.query.orig || store.q
      }
    }
    
    
    const advanced_link = computed(() => {
       return  `/search?q=${store.q}&dict=${store.dict}&scope=${store.scope}`
      
      
    })
    
    const dict_link = ((dict) => {
      let url = "/" + dict
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
  overflow-x: auto;
  white-space: nowrap;
  scrollbar-width: none;
}

button {
  font-weight: 600;
}

ul {
  @apply text-lg;
}

a {
@apply flex py-1 px-4 md:text-sm text-gray-900 bg-tertiary border-gray-700 md:text-primary border md:border-none whitespace-nowrap;
border-radius: 2rem;

}

a[aria-current=true] {
  @apply bg-primary-lighten text-tertiary
}

  /* Hide scrollbar for Chrome, Safari and Opera */
.nav-container::-webkit-scrollbar {
  display: none;
}



</style>
