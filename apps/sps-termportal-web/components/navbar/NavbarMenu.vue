<template>
  <div class="">
    <button
      class="tp-hover-focus ml-auto mr-0 flex rounded border border-transparent p-1"
      aria-haspopup="true"
      aria-controls="overlayMenu"
      :aria-label="$t('navBar.menuButtonShow')"
      :title="$t('navBar.menuButtonShow')"
      @click="menu.toggle"
    >
      <Icon
        name="tabler:menu-2"
        aria-hidden="true"
        size="2em"
      />
    </button>
    <Menu
      id="overlayMenu"
      ref="menu"
      :model="menuOptions"
      :popup="true"
    >
      <template #item="{ item, props }">
        <NuxtLink
          v-if="item.to"
          class="p-menuitem-link"
          :to="item.to"
          v-bind="props.action"
        ><span class="p-menuitem-text">
          {{ item.label }}
        </span>
        </NuxtLink>
        <a
          v-else
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
const { locale, locales, setLocale } = useI18n();

const menu = ref();

const menuOptions = computed(() => [
  {
    label: $t("navBar.navigation"),
    items: [
      { label: $t("global.termbase", 2), to: "/termbaser" },
      { label: $t("navBar.hjelp"), to: "/hjelp" },
      { label: $t("navBar.om"), to: "/om" },
      { label: $t("navBar.innstillinger"), to: "/innstillinger" },
    ],
  },
  {
    label: $t("navBar.language"),
    items: locales.value.map(loc => ({
      label: loc.code,
      command: () => {
        setLocale(loc.code);
      } })),

  },
]);
</script>
