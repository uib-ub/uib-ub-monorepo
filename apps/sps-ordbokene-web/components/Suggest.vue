<template>
   <div class="mb-10">
    <SuggestResults v-if="!pending && inflect" :suggestions="inflect">
        <component :is="props.dict=='bm,nn'? 'h2' : 'h3'">{{$t('notifications.other_inflected', {word: route.query.orig || store.q})}}</component>
    </SuggestResults>
    <SuggestResults v-if="!pending && similar" :suggestions="similar">
        <component :is="props.dict=='bm,nn'? 'h2' : 'h3'">{{$t('notifications.similar')}}</component>

    </SuggestResults>
  </div>

</template>

<script setup>
import { useStore } from '~/stores/searchStore'
const store = useStore()
const route = useRoute()

const props = defineProps({
    dict: String
})

const suggestQuery = `${store.endpoint}api/suggest?&q=${route.query.orig || store.q}&dict=${props.dict}&n=10&dform=int&meta=n&include=eis`

const { pending, data } = await useFetch(() =>  suggestQuery, {key: suggestQuery})

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