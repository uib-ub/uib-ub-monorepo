<template>
      <div class="pb-1 md:mx-10">
        
  
    <div class="callout" aria-live="polite" role="status"><Icon name="bi:info-circle-fill" size="1.25em" class="mr-3 text-primary mb-0.5"/>  <strong>{{store.q}}</strong>{{($t('notifications.not_a_word') + $t('dicts_inline.'+store.dict))}}.<div v-if="suggestions && suggestions.length" class="sr-only">Se lenkene under med forslag til andre søkeord.</div></div>
    <SuggestResults v-if="suggestions.similar" :suggestions="suggestions.similar" :key="store.q">{{$t('notifications.did_you_mean')}}</SuggestResults>
  

    </div>
</template>
  
<script setup>
import { useStore } from '~/stores/searchStore'
import { useRoute } from 'vue-router'
const store = useStore()
const route = useRoute()

definePageMeta({
  middleware: ['endpoint-middleware', 'dict-middleware']
  })

const suggestions = ref({similar: []})  

const { data: raw_suggest, refresh } = await useAsyncData(
    'suggest_'+ store.q + "_" + store.dict, 
    () => $fetch(`${store.endpoint}api/suggest?&q=${store.q}&dict=${store.dict}&n=20&dform=int&meta=n&include=eis`))

suggestions.value = filterSuggestions(raw_suggest.value, store.q)

watch(() => route.query, () =>  {
    refresh()

})

watch(raw_suggest, (new_raw_suggest) => {
    suggestions.value = filterSuggestions(raw_suggest.value, store.q)
})

</script>