<template>
  <div class="error-page flex flex-col items-center justify-center h-screen">
    <img v-if="error.statusCode == 404" alt="404" src="assets/images/error-illustration.svg"/>

    <h1 v-if="error.statusCode == 404" class="mt-10" >{{$t('error.404.title')}}</h1>
    <h1 v-else>{{error.statusCode}}: {{$t('error.generic.title')}}</h1>
    <p class="m-3 text-center">
      {{$t(`error.${error.statusCode == 404 && 404 || 'generic'}.description`)}}
    </p>
    <NuxtLink class="m-5" to="/">{{$t('home')}}</NuxtLink>
    </div>

</template>

<script>
  export default {
    props: ['error'],
  }
</script>