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
          'max-w-screen-2xl px-2 pb-3 pt-2 xs:pb-4 sm:px-3 md:px-4 lg:px-5 lg:pl-0':
            route.path !== '/',
          'container mb-[10vh] max-w-5xl p-5': route.path === '/',
        }"
      >
        <header>
          <h1
            v-if="route.path === '/'"
            class="pb-9 pt-[0.2em] text-5xl font-light tracking-tight text-black/75 antialiased xs:text-6xl sm:text-7xl md:text-8xl"
          >
            Termportalen
          </h1>
        </header>
        <slot />
      </div>
    </div>
    <ButtonScrollTop />
    <FooterTP />
  </div>
</template>

<script setup>
const route = useRoute();
</script>
