<template>
  <div class="flex h-9">
    <AppLink class="group flex items-center space-x-2 text-lg" to="/search">
      <Icon
        name="ion:return-up-back-sharp"
        size="1.7em"
        aria-hidden="true"
        class="h-7 w-12 rounded bg-tpblue-400 text-white group-hover:bg-blue-700"
      ></Icon>
      <div class="text-gray-500 group-hover:text-black group-hover:underline">
        {{ $t("id.tilbake") }}
      </div></AppLink
    >
  </div>
</template>
