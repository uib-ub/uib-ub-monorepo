<template>
  <div class="flex min-h-screen flex-col">
    <div
      class="flex grow"
      :class="{ 'items-center justify-center': route.path === '/' }"
    >
      <div
        class="flex-1"
        :class="{
          'max-w-screen-2xl px-2 pb-3 pt-2 xs:pb-4 sm:px-3 md:px-4 lg:px-5 xl:pl-0':
            route.path !== '/',
          'container mb-[10vh] max-w-[40em] p-9': route.path === '/',
        }"
      >
        <header>
          <h1 v-if="route.path === '/'" class="pb-9">
            <LogoTermportalen img-style="width: 450px" />
            <div class="text-xl ml-[133px] mt-[-25px] font-base text-gray-500">admin</div>
          </h1>
        </header>
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute();
</script>
