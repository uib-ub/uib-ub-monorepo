<template>
  <div class="error-page flex flex-col items-center justify-center h-screen">
    <img v-if="error.statusCode == 404" alt="404" src="assets/images/error-illustration.svg"/>

    <h1 v-if="error.statusCode == 404" class="mt-10" >{{$t('error.404.title')}}</h1>
    <h1 v-else-if="error.statuscode==503">{{$t('error.503.title')}}</h1>
    <h1 v-else>{{$t('error.generic.title')}}</h1>
    <p class="m-3 text-center">
      {{$t(`error.${error.statusCode == 404 && 404 || error.statusCode == 503 && 503 || 'generic'}.description`)}}
    </p>
    <NuxtLink v-if="error.statusCode == 404" class="m-5" to="/">{{$t('home')}}</NuxtLink>
    </div>

</template>

<script>
  export default {
    props: ['error'],
  }
</script>