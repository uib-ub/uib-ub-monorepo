<template>
  <footer class="bg-tpblue-400 static left-0 right-0 bottom-0 text-white">
    <div class="flex flex-wrap items-center justify-center gap-x-6 p-2">
      <nuxt-img
        src="/logo_sprakradet_neg.png"
        width="180px"
        alt="logo språkrådet"
      />
      <nuxt-img src="/logo_ugle_white.svg" width="100px" alt="logo uib" />
      <div class="flex flex-col space-y-2 text-lg">
        <AppLink
          to="mailto:termportalen@uib.no"
          class="group inline-block leading-snug hover:text-gray-200"
        >
          <span>{{ $t("footer.contact") }}: </span><br />
          <span class="group-hover:underline"
            >termportalen@uib.no</span
          ></AppLink
        >
        <AppLink
          class="hover:text-gray-200 hover:underline"
          to="https://uustatus.no/nb/erklaringer/publisert/a139f9ba-80eb-4176-bb6d-b784efaf205a"
          >{{ $t("footer.accDeclaration") }}</AppLink
        >
      </div>
    </div>
  </footer>
</template>
