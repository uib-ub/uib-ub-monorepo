<template>
<div>
</div>
   <div v-if="data" class="mb-10 mx-2 flex flex-col gap-8 mt-3">
    <div v-if="data.inflect.length" class ="callout py-0 my-0">
        <SuggestResults :suggestions="data.inflect"  :dict="dict">
            <h3><Icon name="bi:info-circle-fill" size="1rem" class="mr-3"/>{{$t('notifications.inflected', {dict: $t('dicts.'+dict)})}}</h3><span id="translation-description"></span>{{" "}}
        </SuggestResults>
    </div>
    <div v-if="data.translate.length" class ="callout py-0 my-0">
        <SuggestResults compare :suggestions="data.translate"  :dict="dict" icon="bi:book-half">
                <h3><Icon name="bi:robot" size="1rem" class="mr-3"/>{{$t('notifications.translation_title')}}</h3><p class="pt-2">{{$t('notifications.translation')}}</p>
        </SuggestResults>
    </div>
    <div v-if="data.similar.length">
        <SuggestResults  :suggestions="data.similar" :dict="dict">
            <h3>{{$t('notifications.similar', {dict: $t('dicts.'+dict)})}}</h3>
        </SuggestResults>
    </div>
    <div v-if="data.freetext && !( (articles_meta[dict] && articles_meta[dict].total) || data.translate.length || data.inflect.length )" class ="callout pt-0 pb-4 my-0">
            <h3><Icon name="bi:info-circle-fill" size="1rem" class="mr-3"/>{{$t('notifications.fulltext.title', {dict: $t('dicts.'+dict)})}}</h3>
            <p>{{$t('notifications.fulltext.description')}}</p>
            <div class="flex">
            <NuxtLink :to="`/${$i18n.locale}/search?q=${data.freetext}&dict=${store.dict}&scope=eif`" class=" bg-primary text-white ml-auto p-1 rounded px-3 mt-3 border-none">{{$t('to_advanced')}} 
            <Icon name="bi:arrow-right"/>
            </NuxtLink>
            </div>
    </div>
    <div v-if="!((articles_meta[dict] && articles_meta[dict].total) || data.translate.length || data.inflect.length || data.similar.length || data.freetext )" class="callout pt-0 my-0">
        <h3><Icon name="bi:info-circle-fill" size="1rem" class="mr-3"/>{{$t('notifications.no_results.title')}}</h3>
        <p>{{$t('notifications.no_results.description[0]', {dict: $t('dicts.'+dict)})}}.</p>
        <p v-if="store.q.length > 10" class="my-2">{{$t('notifications.no_results.description[1]')}}</p>
    </div>
</div>

</template>

<script setup>
import { useSearchStore } from '~/stores/searchStore'
import { useSessionStore } from '~/stores/sessionStore'
const store = useSearchStore()
const session = useSessionStore()
const route = useRoute()

const props = defineProps({
    dict: String,
    articles_meta: Object
})

const suggestQuery = `${session.endpoint}api/suggest?&q=${store.q}&dict=${props.dict}&n=4&dform=int&meta=n&include=eifst`
const { data  } = await useFetch(suggestQuery, {
    transform: response => {
        let inflect = []
        let translate = []
        let similar = []
        let freetext

        if (response.a) {

            if (response.a.translate) {
                if (store.dict=='bm,nn' && props.articles_meta[props.dict].total == 0) {
                        translate = response.a.translate.map(item => item[0])
                }
                else {         
                    similar = response.a.translate.map(item => item[0])         

                }

               }
            

            store.suggest = response.a // reuse the response in the redirect notification
            if (response.a.inflect) {
                response.a.inflect.forEach(item => {
                    if (!similar.includes(item) &&
                    item[0] != store.w && item[0] != store.q
                    && item[0][0] != '-'
                    && item[0].slice(-1) != '-' 
                    && !store.lemmas[props.dict].has(item[0])
                    ) {
                        inflect.push(item[0])
                    }
                });
            }
            if (response.a.exact) {
                response.a.exact.forEach(item => {
                    if (item[0] != store.q
                        && item[0] != store.q
                        && item[0][0] != '-'
                        && item[0].slice(-1) != '-'
                        && !similar.includes(item)
                        && (item[0].length <= store.q.length
                            || (item[0].slice(0, store.q.length) !=store.q && item[0].slice(0, store.q.length) != store.q && item[0] != "å " + store.q && item[0] != "å " + store.q))) {
                                similar.unshift(item[0])
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
                        && !similar.includes(item)) {
                        similar.push(item[0])
                    }
                })
            
            }
            if (response.a.freetext) {
                if (response.a.freetext[0][0].length == store.q.length) {
                    freetext = response.a.freetext[0][0]
                }
                
            }
        }






        return {
            inflect, translate, similar, freetext
        }
    },
    server: false
})

</script>