<template>
  <div class="flex min-h-screen flex-col bg-white">
    <NavBar />
    <div class="flex grow" :class="{ '': route.path === '/' }">
      <div
        class="flex-1"
        :class="{
          'max-w-screen-2xl px-2 pb-3 pt-2 xs:pb-4 sm:px-3 md:px-4 lg:px-5':
            route.path !== '/',
          'container mb-[10vh] max-w-[60em] p-9': route.path === '/',
        }"
      >
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute();
</script>
