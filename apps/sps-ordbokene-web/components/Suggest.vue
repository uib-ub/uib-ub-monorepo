<template>
<div>
</div>
   <div v-if="data" class="mb-10 mx-2 flex flex-col gap-8 mt-3">
    <div v-if="data.inflect.length" class ="callout py-0 my-0">
        <SuggestResults :suggestions="data.inflect"  :dict="dict" plausible-goal="click_inflect">
            <h3><Icon name="bi:info-circle-fill" size="1.25rem" class="mr-2 mb-1"/>
            {{$t('notifications.inflected_title', 1, {locale: scoped_locale})}}
            </h3>
            <i18n-t :keypath="articles_meta[dict] && articles_meta[dict].total ? 'notifications.also_inflected':'notifications.inflected'" :locale="scoped_locale">
                <template v-slot:word>
                    <em>{{store.q}}</em>
                </template>
            </i18n-t>
        </SuggestResults>
    </div>
    <div v-if="data.translate.length" class ="callout py-0 my-0">
        <SuggestResults compare :suggestions="data.translate"  :dict="dict" icon="bi:book-half" plausible-goal="click_translate">
                <h3><Icon name="bi:translate" size="1.25rem" class="mr-2 mb-1"/>
                {{$t('notifications.translation_title', 1, {locale: scoped_locale})}}</h3>
            <p class="pt-2">
                <i18n-t keypath="notifications.translation" tag="div" id="citation" :locale="scoped_locale" :plural="data.translate.length > 1 ? 2 : 1">
                    <template v-slot:adm>
                        <em>Administrativ ordliste</em>
                    </template>
                </i18n-t>
            </p>
        </SuggestResults>
    </div>
    <div v-if="data.similar.length">
        <SuggestResults  :suggestions="data.similar" :dict="dict" plausible-goal="click_similar">
            <h3>{{$t('notifications.similar', 1, {locale: scoped_locale})}}</h3>
        </SuggestResults>
    </div>
    <div v-if="data.freetext && !( (articles_meta[dict] && articles_meta[dict].total) || data.translate.length || data.inflect.length )" class ="callout pt-0 pb-4 my-0">
            <h3><Icon name="bi:info-circle-fill" size="1.25rem" class="mr-2 mb-1"/>{{$t('notifications.fulltext.title', {dict: $t('dicts.'+dict)})}}</h3>
            <p>{{$t('notifications.fulltext.description', 1, {locale: scoped_locale})}}</p>
            <div class="flex">
            <NuxtLink :to="`/${$i18n.locale}/search?q=${data.freetext}&dict=${store.dict}&scope=eif`" @click="track_freetext(store.q, data.freetext)" class=" bg-primary text-white ml-auto p-1 rounded px-3 mt-3 border-none pr-1">{{$t('to_advanced')}} 
            <Icon name="bi:arrow-right-short" size="1.5rem"/>
            </NuxtLink>
            </div>
    </div>
    <div v-if="!(articles_meta[dict] && articles_meta[dict].total) && no_suggestions" class="callout pt-0 my-0">
        <h3><Icon name="bi:info-circle-fill" size="1.25rem" class="mr-2 mb-1"/>{{$t('notifications.no_results.title')}}</h3>
        <p>
            <i18n-t keypath="notifications.no_results.description[0]" :locale="scoped_locale">
                <template v-slot:dict>
                    <em>{{$t('dicts.'+dict, {locale: scoped_locale})}}</em>.
                </template>
            </i18n-t>
        </p>
        <p v-if="store.q.length > 8" class="my-2">{{$t('notifications.no_results.description[1]', 1, {locale: scoped_locale})}}</p>
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
    scoped_locale: String,
    dict: String,
    articles_meta: Object
})

const no_suggestions = useState('no_suggestions_' + props.dict)

const track_freetext = (from, to) => {
    useTrackEvent('click_freetext_' + props.dict, {props: {from, to, combined: from + "|" + to}})
}

const suggestQuery = `${session.endpoint}api/suggest?&q=${store.q}&dict=${props.dict}&n=8&dform=int&meta=n&include=eifst`
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

        if (!( inflect.length || translate.length || similar.length || freetext )) {
            useTrackEvent('no_suggestions', {props: {query: props.dict + "/" + store.q}})
            no_suggestions.value = true
        }
        else {
            no_suggestions.value = false
        }
        return {
            inflect, translate, similar, freetext
        }
    }
})

</script>