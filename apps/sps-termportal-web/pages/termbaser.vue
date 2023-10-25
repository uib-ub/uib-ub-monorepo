<template>
  <div>
    <Head>
      <Title>{{ $t("global.termbase", 2) }} | {{ $t("index.title") }}</Title>
    </Head>
    <main>
      <h1 id="main" class="pb-3 pt-6">
        <AppLink
          to="#main"
          class="tp-hover-focus border-transparent px-2 py-1 text-3xl"
          >{{ $t("global.termbase", 2) }}</AppLink
        >
      </h1>
      <ul class="grid grid-cols-1 gap-2 md:grid-cols-2">
        <li v-for="tb in termbaseOrder" :key="tb">
          <AppLink :to="`/${tb}`"
            ><div
              class="tp-focus-hover rounded-[7px] border border-gray-300 px-2.5 py-1.5"
            >
              {{ lalof(`${tb}-3A${tb}`) }}
            </div>
          </AppLink>
        </li>
      </ul>
    </main>
  </div>
</template>

<script setup lang="ts">
const locale = useLocale();
</script>
