<template>
    {{data}}
</template>

<script setup>
import { useStore } from '~/stores/searchStore'
const store = useStore()
const route = useRoute()
const { data } = await useFetch(() =>  `${store.endpoint}api/suggest?&q=${route.query.q}&dict=${route.params.dict}&n=20&dform=int&meta=n&include=eis`)
</script>