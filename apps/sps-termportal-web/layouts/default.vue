<template>
  <div class="flex min-h-screen flex-col">
    <HeaderMain />
    <div
      class="flex grow"
      :class="{ 'items-center justify-center': route.path === '/' }"
    >
      <div
        class="flex-1"
        :class="{
          'max-w-screen-2xl px-2 pb-3 pt-2 xs:pb-4 sm:px-3 md:px-4 lg:px-5 xl:pl-0':
            route.path !== '/',
          'container mb-[10vh] max-w-[69em] p-5': route.path === '/',
        }"
      >
        <slot />
      </div>
    </div>
    <FooterTP />
  </div>
</template>

<script setup>
const route = useRoute();
</script>
