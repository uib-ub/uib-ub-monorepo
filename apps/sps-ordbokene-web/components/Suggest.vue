<template>
   <div class="mb-10 mx-2 flex flex-col gap-8 mt-3">
    
    <div v-if="inflections.length" class ="callout py-0 my-0">
        <SuggestResults :suggestions="inflections"  :dict="dict">
            <h3><Icon name="bi:info-circle-fill" size="1rem" class="mr-3"/>{{$t('notifications.inflected', {dict: $t('dicts.'+dict)})}}</h3><span id="translation-description"></span>{{" "}}
        </SuggestResults>
    </div>
    <div v-if="translated.length" class ="callout py-0 my-0">
        <SuggestResults compare :suggestions="translated"  :dict="dict" icon="bi:book-half">
                <h3><Icon name="bi:robot" size="1rem" class="mr-3"/>{{$t('notifications.translation_title')}}</h3><p class="pt-2">{{$t('notifications.translation')}}</p>
        </SuggestResults>
    </div>
    <div v-if="suggest.length">
        <SuggestResults  :suggestions="suggest" :dict="dict">
            <h3>{{$t('notifications.similar', {dict: $t('dicts.'+dict)})}}</h3>
        </SuggestResults>
    </div>
    <div v-if="freetext.length && !( articles_meta[dict].total || translated.length || inflections.length )" class ="callout pt-0 pb-4 my-0">
            <h3><Icon name="bi:info-circle-fill" size="1rem" class="mr-3"/>{{$t('notifications.fulltext.title', {dict: $t('dicts.'+dict)})}}</h3>
            <p>{{$t('notifications.fulltext.description')}}</p>
            <div class="flex">
            <NuxtLink :to="`/search?q=${store.q}&dict=${store.dict}&scope=eif`" class=" bg-primary text-white ml-auto p-1 rounded px-3 mt-3">{{$t('to_advanced')}} 
            <Icon name="bi:arrow-right"/>
            </NuxtLink>
            </div>
    </div>
    <div v-if="!( articles_meta[dict].total || translated.length || inflections.length || suggest.length || freetext.length )" class="callout pt-0 my-0">
        <h3><Icon name="bi:info-circle-fill" size="1rem" class="mr-3"/>{{$t('notifications.no_results.title')}}</h3>
        <p>{{$t('notifications.no_results.description[0]', {dict: $t('dicts.'+dict)})}}.</p>
        <p v-if="store.q.length > 10" class="my-2">{{$t('notifications.no_results.description[1]')}}</p>
    </div>
</div>

</template>

<script setup>
import { useStore } from '~/stores/searchStore'
const store = useStore()
const route = useRoute()

const props = defineProps({
    dict: String,
    articles_meta: Object
})


const suggestQuery = `${store.endpoint}api/suggest?&q=${store.q}&dict=${props.dict}&n=4&dform=int&meta=n&include=eifs`
const apertiumQuery = `https://apertium.org/apy/translate?langpair=${store.dict == 'bm,nn' ? {bm: 'nno|nob', nn: 'nob|nno'}[props.dict] : {bm: 'nno|nob', nn: 'nob|nno'}[props.dict]}&q=${store.q}`

const translated = ref([])
const inflections = ref([])
const suggest = ref([])
const freetext = ref([])


await Promise.all([$fetch(apertiumQuery).then(response => {
                    const translatedText = response.responseData.translatedText
                    if (translatedText.includes('*') || translatedText == store.q ) {
                        return
                    }
                    else {
                        return $fetch(`${store.endpoint}api/suggest?&q=${translatedText}&dict=${props.dict}&n=1&dform=int&meta=n&include=ei`).then(suggestResponse => {
                            if (suggestResponse.a) {
                                
                                const exact = suggestResponse.a.exact
                                const inflect = suggestResponse.a.inflect
                                if (exact && exact[0][0].length == translatedText.length && exact[0][0] != store.q) {
                                    if (store.dict=='bm,nn' && props.articles_meta[props.dict].total == 0) {
                                        translated.value.push(exact[0][0])
                                    }
                                    if (!suggest.value.includes(exact[0][0]) && !store.lemmas[props.dict].has(exact[0][0])) {
                                        suggest.value.unshift(exact[0][0])
                                    }
                                    
                                }
                                else if (inflect && inflect[0][0] != store.q) {
                                    if (!suggest.value.includes(inflect[0][0]) && !store.lemmas[props.dict].has(inflect[0][0]) && !inflections.value.includes(inflect[0])) {
                                        suggest.value.unshift(inflect[0][0])
                                    }

                                }
                            }
                        })
                    }
                    }).catch(error => { console.log("Apertium not available", error)}),
                    $fetch(suggestQuery).then(response => {
                        if (response.a) {
                            store.suggest = response.a // reuse the response in the redirect notification
                            if (response.a.inflect) {
                                response.a.inflect.forEach(item => {
                                    if (!suggest.value.includes(item) &&
                                    item[0] != store.w && item[0] != store.q
                                    && item[0][0] != '-'
                                    && item[0].slice(-1) != '-' 
                                    && !store.lemmas[props.dict].has(item[0])
                                    ) {
                                        inflections.value.push(item[0])
                                    }
                                });
                            }
                            if (response.a.exact) {
                                response.a.exact.forEach(item => {
                                    if (item[0] != store.q
                                        && item[0] != store.q
                                        && item[0][0] != '-'
                                        && item[0].slice(-1) != '-'
                                        && !suggest.value.includes(item)
                                        && (item[0].length <= store.q.length
                                            || (item[0].slice(0, store.q.length) !=store.q && item[0].slice(0, store.q.length) != store.q && item[0] != "å " + store.q && item[0] != "å " + store.q))) {
                                                suggest.value.unshift(item[0])
                                        }

                                    }
                            )
                            }
                            if (response.a.similar) {
                                response.a.similar.forEach(item => {
                                    if(item[0] != store.q
                                        && item[0][0] != '-'
                                        && item[0].slice(-1) != '-'
                                        && !store.lemmas[props.dict].has(item[0])
                                        && !suggest.value.includes(item)) {
                                        suggest.value.push(item[0])
                                    }
                                })
                            
                            }
                            if (response.a.freetext) {
                                freetext.value = response.a.freetext
                            }
                        }
                    })])

</script>