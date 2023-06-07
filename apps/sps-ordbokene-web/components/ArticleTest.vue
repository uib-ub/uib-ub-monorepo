<template>
    {{$route.params}}<br>
    SINGLE {{single}}

</template>

<script setup>
const props = defineProps({
    article_id: Number,
    dict: String,
    welcome: Boolean,
    single: Boolean
})
</script>