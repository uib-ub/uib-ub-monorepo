<template>
    <li class="example">
        <DefElement tag="em" :body="body.quote"  v-on:link-click="link_click" :dict="dict" :content_locale="content_locale" :semicolon="semicolon && !(body.explanation && body.explanation.content.length)? true : false"/><span v-if="body.explanation && body.explanation.content.length"> – </span>
        <DefElement tag="span" :body="body.explanation" v-if="body.explanation && body.explanation.content.length" v-on:link-click="link_click" :dict="dict" :content_locale="content_locale" :semicolon="semicolon && body.explanation && body.explanation.content.length ? true : false"/>
    </li>
        
    </template>
    <script setup>
    
    const props = defineProps({
        body: Object,
        dict: String,
        content_locale: String,
        semicolon: Boolean
    })
    
    const emit = defineEmits(['link-click'])
    const link_click = (event) => {
        emit('link-click', event)
    }
    
    </script>
    
    <style scoped>
    
    em {
        font-style: italic !important;
        display: inline;
    }
    
    
    </style>