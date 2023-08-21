<template>
   <div class="mb-10">
    <SuggestResults :minimal="true" :dict="dict" v-if="!pending && data.length" :suggestions="data"><h3>{{$t('notifications.similar')}}</h3></SuggestResults>
  </div>

</template>

<script setup>
import { useStore } from '~/stores/searchStore'
const store = useStore()
const route = useRoute()

const props = defineProps({
    dict: String,
})

const query = `${store.endpoint}api/suggest?&q=${route.query.q}&dict=${props.dict}${route.query.pos ? '&wc=' + route.query.pos : ''}&n=10&dform=int&meta=n&include=s`
const { data, pending } = useFetch(query, {key: query,
                                    transform: response => {
                                        console.log("RESPONSE", response)
                                        if (response.a && response.a.similar) {
                                            return response.a.similar.filter(item => item[0] != "-"
                                                                                    && item[0].slice(-1) != '-' )
                                        }
                                        else {
                                            return []
                                        }
                                    }})

</script>