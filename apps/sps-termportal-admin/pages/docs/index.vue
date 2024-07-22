<template>
  <div class="flex">
    <!-- <SideBar /> -->
    <main class="content-page max-w-3xl pt-8 flex">
      <section id="content">
        <h1 class="mb-2 text-2xl">Documentation</h1>
        <ContentDoc path="arbeidsflyter" />
        <ContentDoc path="system-behaviour" />
      </section>
    </main>
    <ToC class="ml-10 mt-[5rem] hidden lg:block" content-selector="#content" />
  </div>
</template>

<style>
.content-page h2 {
  @apply pt-3 text-xl font-semibold;
}

.content-page h3 {
  @apply pt-6 text-lg font-semibold;
}

.content-page h4 {
  @apply pt-5 font-semibold;
}

.content-page h5 {
  @apply pt-4 font-semibold;
}

.content-page p {
  @apply py-1;
}
.content-page ul {
  @apply list-disc;
}

.content-page li {
  @apply ml-8;
}

.content-page a {
  @apply underline underline-offset-4 hover:decoration-2;
}
</style>
