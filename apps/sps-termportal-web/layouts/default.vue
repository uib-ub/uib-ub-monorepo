<template>
  <div class="flex min-h-screen flex-col">
    <HeaderMain />
    <div
      class="flex grow"
      :class="{ 'items-center justify-center': route.path === '/' }"
    >
      <div
        v-if="route.path !== '/'"
        class="w-0 xl:w-[10vw] xl:min-w-[10em] xl:max-w-[13em]"
      ></div>
      <div
        class="container flex-1"
        :class="{
          'xs:pb-4 max-w-screen-xl px-2 pt-2 sm:px-3 md:px-4 lg:px-5 xl:pl-0':
            route.path !== '/',
          'mb-[10vh] max-w-5xl p-5': route.path === '/',
        }"
      >
        <header>
          <h1
            v-if="route.path === '/'"
            class="xs:text-6xl pb-9 pt-[0.2em] text-5xl font-light tracking-tight text-black/75 antialiased sm:text-7xl md:text-8xl"
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
