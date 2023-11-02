<template>
    <li class="example notranslate">
        <DefElement tag="em" :body="body.quote"  v-on:link-click="link_click" :dict="dict" :scoped_locale="scoped_locale" :semicolon="semicolon && !(body.explanation && body.explanation.content.length)? true : false"/><span v-if="body.explanation && body.explanation.content.length"> – </span>
        <DefElement tag="span" :body="body.explanation" v-if="body.explanation && body.explanation.content.length" v-on:link-click="link_click" :dict="dict" :scoped_locale="scoped_locale" :semicolon="semicolon && body.explanation && body.explanation.content.length ? true : false"/>
    </li>
        
    </template>
    <script setup>
    
    const props = defineProps({
        body: Object,
        dict: String,
        scoped_locale: String,
        semicolon: Boolean
    })
    
    const emit = defineEmits(['link-click'])
    const link_click = (event) => {
        emit('link-click', event)
    }
    
    </script>
    
    <style scoped>
    
    em {
        @apply inline !italic;
    }
    
    
    </style>