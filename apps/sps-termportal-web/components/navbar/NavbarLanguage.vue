<template>
  <div>
    <button
      class="tp-hover-focus group border-transparent pb-1.5 pl-2.5 pr-1.5 pt-0.5"
      :aria-label="`${$t('navBar.language')}: ${$t('global.lang.' + locale)}`"
      aria-haspopup="true"
      aria-controls="langMenu"
      @click="langMenu.toggle"
    >
      <div class="relative" aria-hidden="true">
        <div class="absolute -bottom-[9px] -left-[8px]">
          <span class="rounded-[5px] bg-white text-[0.6em]">
            <span
              class="h-1 text-small px-[3px] font-semibold uppercase group-hover:text-gray-700 group-focus:text-gray-700"
              >{{ locale }}</span
            >
          </span>
        </div>
        <Icon
          class="text-gray-600 group-hover:text-gray-700 group-focus:text-gray-700"
          name="material-symbols:language"
          size="1.4em"
        />
      </div>
    </button>
    <Menu id="langMenu" ref="langMenu" :model="langOptions" :popup="true">
      <template #start>
        <div class="px-3 pb-3 pt-1 font-semibold">
          {{ $t("navBar.language") }}
        </div>
      </template>
      <template #item="{ item, props }">
        <a
          class="p-menuitem-link"
          v-bind="props.action"
          :aria-current="locale === item.label"
        >
          <div class="p-menuitem-text space-x-2">
            <span class="">
              {{ $t("global.lang." + item.label) }}
            </span>
            <span aria-hidden="true">
              <Icon
                v-if="locale === item.label"
                class="-mt-1.5"
                name="mdi:check"
                size="1.3em"
              />
            </span>
          </div>
        </a>
      </template>
    </Menu>
  </div>
</template>

<script setup lang="ts">
const locale = useLocale();

const langMenu = ref();
const langOptions = ref(getLangOptions());
</script>
