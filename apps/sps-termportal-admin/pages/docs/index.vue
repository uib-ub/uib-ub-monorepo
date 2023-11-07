import { ContentDoc } from '#build/components';
<template>
  <div class="content-page flex">
    <SideBar></SideBar>
    <main class="max-w-3xl pt-8">
      <h1 class="mb-2 text-2xl">Documentation</h1>
      <ContentDoc path="system-behaviour" />
    </main>
  </div>
</template>

<style>
.content-page h2 {
  @apply pb-2 pt-3 text-xl font-semibold;
}

.content-page h3 {
  @apply pb-1 pt-3 text-lg font-semibold;
}

.content-page p {
  @apply py-1.5;
}
.content-page ul {
  @apply list-disc;
}

.content-page li {
  @apply ml-8;
}

.content-page a {
  @apply underline;
}
</style>
