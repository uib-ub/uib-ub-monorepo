<template>
   <div class="mb-10 mx-2">
    <SuggestResults :minimal="true" :dict="dict" v-if="!pending && data.length" :suggestions="data"><h3>{{$t('notifications.similar')}}</h3></SuggestResults>
    <div v-if="!pending && !data.length" class="callout pt-0 my-0">
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
})

const query = `${session.endpoint}api/suggest?&q=${route.query.q}&dict=${props.dict}${route.query.pos ? '&wc=' + route.query.pos : ''}&n=10&dform=int&meta=n&include=s`
const { data, error, pending } = useFetch(query, {key: query,
                                    transform: response => {
                                        if (response.a && response.a.similar) {
                                            return response.a.similar.filter(item => item[0] != "-"
                                                                                    && item[0].slice(-1) != '-' ).map(pair => pair[0])
                                        }
                                        else {
                                            return []
                                        }
                                    }})


if (error.value && session.endpoint == "https://oda.uib.no/opal/prod/`") {
  session.endpoint = `https://odd.uib.no/opal/prod/`
  console.log("ERROR", error.value)
  refresh()
}

</script>