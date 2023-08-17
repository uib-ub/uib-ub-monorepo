<template>
   <div class="mb-10">
    <div v-if="translated" class ="callout"><Icon name="bi:robot" class="mr-3 mb-1 text-primary"/><span id="translation-description">{{$t('notifications.translation')}}</span>{{" "}}
        <NuxtLink noPrefetch :to="`/bm,nn/${store.q}|${translated}`"><span aria-describedby="translation-description" class="link-content">{{translated}}</span></NuxtLink>
    </div>
    <SuggestResults v-if="inflect.length" :suggestions="inflect"  :dict="dict">
        <component :is="props.dict=='bm,nn'? 'h2' : 'h3'">{{$t('notifications.inflected', {dict: $t('dicts.'+dict)})}}</component>
    </SuggestResults>
    <SuggestResults v-if="suggest.length" :suggestions="suggest" :dict="dict">
        <component :is="props.dict=='bm,nn'? 'h2' : 'h3'">{{$t('notifications.similar', {dict: $t('dicts.'+dict)})}}</component>
    </SuggestResults>
    <div v-if="!( articles_meta[dict].total || translated || inflect.length || suggest.length )" class="callout">Ingen treff</div>
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

const qstring = route.query.orig || store.q
const suggestQuery = `${store.endpoint}api/suggest?&q=${qstring}&dict=${props.dict}&n=5&dform=int&meta=n&include=eis`
const apertiumQuery = `https://apertium.org/apy/translate?langpair=${store.dict == 'bm,nn' ? {bm: 'nno|nob', nn: 'nob|nno'}[props.dict] : {bm: 'nno|nob', nn: 'nob|nno'}[props.dict]}&q=${store.q}`

const translated = ref()
const inflect = ref([])
const suggest = ref([])


await Promise.all([$fetch(apertiumQuery).then(response => {
                    const translatedText = response.responseData.translatedText
                    if (translatedText.includes('*') || translatedText == qstring ) {
                        return
                    }
                    else {
                        return $fetch(`${store.endpoint}api/suggest?&q=${translatedText}&dict=${props.dict}&n=5&dform=int&meta=n&include=ei`).then(suggestResponse => {
                            if (suggestResponse.a) {
                                
                                const exact = suggestResponse.a.exact
                                const inflect = suggestResponse.a.inflect
                                if (exact && exact[0][0].length == translatedText.length && exact[0][0] != store.q) {
                                    if (store.dict=='bm,nn' && props.articles_meta[props.dict].total == 0) {
                                        translated.value = exact[0][0]
                                    }
                                    if (!suggest.value.includes(exact[0][0]) && !store.lemmas[props.dict].has(exact[0][0])) {
                                        suggest.value.unshift(exact[0])
                                    }
                                    
                                }
                                else if (inflect && inflect[0][0] != store.q) {
                                    if (store.dict=='bm,nn' && props.articles_meta[props.dict].total == 0 && props.articles_meta.bm.total + props.articles_meta.nn.total > 0) {
                                        translated.value = inflect[0][0]
                                    }
                                    if (!suggest.value.includes(inflect[0][0]) && !store.lemmas[props.dict].has(inflect[0][0])) {
                                        suggest.value.unshift(inflect[0])
                                    }

                                }
                            }
                        })
                    }
                    }).catch(error => { console.log("Apertium not available")}),
                    $fetch(suggestQuery).then(response => {
                        if (response.a) {
                            if (response.a.inflect) {
                                response.a.inflect.forEach(item => {
                                    if (!suggest.value.includes(item) &&
                                    item[0] != qstring && item[0] != store.q
                                    && item[0][0] != '-'
                                    && item[0].slice(-1) != '-' 
                                    && !store.lemmas[props.dict].has(item[0])
                                    ) {
                                        inflect.value.push(item)
                                    }
                                });
                            }
                            if (response.a.exact) {
                                response.a.exact.forEach(item => {
                                    if (item[0] != store.q
                                        && item[0] != qstring
                                        && item[0][0] != '-'
                                        && item[0].slice(-1) != '-'
                                        && !suggest.value.includes(item)
                                        && (item[0].length <= store.q.length
                                            || (item[0].slice(0, store.q.length) !=store.q && item[0].slice(0, qstring.length) != qstring && item[0] != "å " + store.q && item[0] != "å " + qstring))) {
                                                console.log("ADD EXACT", item)
                                                suggest.value.unshift(item)
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
                                        suggest.value.push(item)
                                    }
                                })
                            
                            }
                        }
                    })])

</script>