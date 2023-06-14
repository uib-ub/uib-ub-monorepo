<template>
<footer class=" bg-primary text-white">
  <div class="ord-container p-3 pt-10 md:pt-4">
  <div class="flex  flex-col xl:flex-row items-center xl:items-start">
    <div class="flex  flex-col md:flex-row m-1 lg:mr-4 items-center">
      <img class="w-[156px] h-[28px] m-1" src="../assets/images/Sprakradet_logo_neg.png" alt="Språkrådet, logo" />
      <img class="w-[80px] h-[80px]mx-4 my-4 lg:my-0 " src="../assets/images/uib-logo.svg" alt="Universitetet i Bergen, logo" />
    </div>
    <div class="p-4 md:px-10 text-center xl:text-left"><em>Bokmålsordboka</em>{{$t('and')}}<em>Nynorskordboka</em>{{$t('footer_description')}}</div>
  </div>
  <nav :aria-label="$t('navigation.site')" class="flex justify-center items-center ">
    <ul class="flex flex-col md:flex-row gap-3 mt-5 pt-2 md:pt-0 md:mt-2 lg:mt-0 justify-center  md:text-lg text-center md:gap-10" >
      <li>
        <NuxtLink :aria-current="$route.name == 'welcome' && 'page'" to="/">{{$t('home')}}</NuxtLink>
      </li>
      <li>
        <NuxtLink :aria-current="$route.name == 'help' && 'page'" to="/help">{{$t('help')}}</NuxtLink></li>
      <li>
        <NuxtLink :aria-current="$route.name == 'about' && 'page'" to="/about">{{$t('about')}}</NuxtLink></li>
      <li>
        <NuxtLink :aria-current="$route.name == 'settings' && 'page'" to="/settings">{{$t('settings.title')}}</NuxtLink></li>
      <li>
        <NuxtLink :aria-current="$route.name == 'contact' && 'page'" to="/contact">{{$t('contact.title')}}</NuxtLink></li>
    </ul>
  </nav>
  
  </div>
  <div class="float-right px-1 text-gray-300" aria-hidden="true">{{$config.public.versionWatermark}}</div>
  
</footer>
</template>

<style scoped>

nav {
  font-variant: all-small-caps;
  letter-spacing: 0.1rem;


}

li {
 @apply pb-1 ;
list-style-type: none;

}



</style>