<template>
  <main class="error-page flex flex-col items-center justify-center h-screen">
    <img v-if="error.statusCode == 404" alt="404" class="mt-20" src="./assets/images/error-illustration.svg"/>

    <h1 v-if="error.statusCode == 404" class="mt-10" >{{$t('error.404.title')}}</h1>
    <h1 v-else>{{error.statusCode}}: {{$t('error.generic.title')}}</h1>
    <p class="m-3 text-center">
      {{$t(`error.${error.statusCode == 404 && 404 || 'generic'}.description`)}}
    </p>
    <NuxtLink class="m-5 font-bold text-primary-darken" to="/">{{$t('home')}}</NuxtLink>
    </main>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
const i18n = useI18n()
const props = defineProps({
  error: Object
})

useHead({
    htmlAttrs: {
      lang: {nob: 'nb', nno: 'nn', eng: 'en'}[i18n.locale.value]
    },
    title: props.error.statusCode + ": " + i18n.t('error.404.title')
})

</script>