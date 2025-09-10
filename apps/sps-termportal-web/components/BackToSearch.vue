<template>
  <div class="flex h-9">
    <AppLink
      class="group flex items-center space-x-2 text-lg"
      to="/search"
    >
      <div class="bg-tpblue-400 group-hover:bg-blue-800 rounded h-7 w-10 flex items-center justify-center text-white">
        <Icon
          name="ion:return-up-back-sharp"
          size="1.6em"
          aria-hidden="true"
        />
      </div>
      <div class="text-gray-500 group-hover:text-black group-hover:underline">
        {{ $t("id.tilbake") }}
      </div>
    </AppLink>
  </div>
</template>
