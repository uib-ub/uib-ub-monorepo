<template>
   <div class="my-10">
    <SuggestResults v-if="!pending && inflect" :suggestions="inflect">{{$t('notifications.other_inflected', {word: route.query.orig || store.q})}}</SuggestResults>
    <SuggestResults v-if="!pending && similar" :suggestions="similar">{{$t('notifications.similar')}}</SuggestResults>
  </div>

</template>

<script setup>
import { useStore } from '~/stores/searchStore'
const store = useStore()
const route = useRoute()
const { pending, data } = await useFetch(() =>  `${store.endpoint}api/suggest?&q=${route.query.orig || store.q}&dict=${route.params.dict}&n=10&dform=int&meta=n&include=eis`)

const inflect = computed(() => {
    return data.value.a.inflect ? data.value.a.inflect.filter(item => 
                                item[0] != route.query.orig && item[0] != store.q
                                && item[0][0] != '-'
                                && item[0].slice(-1) != '-' ) : []
                            
})

const similar = computed(() => {
    let assembled = []
    if (data.value.exact) {
        assembled = data.value.a.exact.filter(item => 
                item[0] != store.q
                && item[0] != route.query.orig
                && (item[0].length <= store.q.length
                || (item[0].slice(0, store.q.length) !=store.q && item[0].slice(0, route.query.orig.length) != route.query.orig && item[0] != "å " + store.q && item[0] != "å " + route.query.orig)))
    }
    if (data.value.a.similar) {
        assembled = assembled.concat(
            data.value.a.similar.filter(item => 
            item[0] != store.q
            && item[0][0] != '-'
            && item[0].slice(-1) != '-')
        )

    }
    return  assembled
})

</script>