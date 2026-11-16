<template>
  <div>
    <button
      class="tp-hover-focus group border-transparent px-2 py-1 hover:text-gray-700 focus:text-gray-700"
      aria-haspopup="menu"
      aria-controls="termbaseMenu"
      @click="termbaseMenu.toggle"
    >
      {{ $t("global.termbase", 2) }}
    </button>
    <Menu
      id="termbaseMenu"
      ref="termbaseMenu"
      :model="termbaseOptions"
      :popup="true"
      class="termbase-menu"
    >
      <template #item="{ item, props }">
        <NuxtLink
          v-if="item.label"
          class="p-menuitem-link"
          :href="item.route"
          v-bind="props.action"
        ><span class="p-menuitem-text">
          {{
            typeof item.label === "function"
              ? getLaLo(item.label())
              : getLaLo(item.label)
          }}
        </span>
        </NuxtLink>
      </template>
    </Menu>
  </div>
</template>

<script setup lang="ts">
const { getLaLo } = useLazyLocale();

const orderedTermbases = useOrderedTermbases();
const termbaseMenu = ref();
const termbaseOptions = computed(() =>
  orderedTermbases.value.map((tb) => {
    return {
      label: `${tb}-3A${tb}`,
      route: `/tb/${tb}`,
    };
  }),
);
</script>

<style>
#termbaseMenu {
  max-height: 66vh;
  width: 320px;
  min-width: 320px;
  max-width: 320px;
  overflow: hidden;
}

#termbaseMenu_list {
  max-height: 66vh;
  overflow: hidden auto;
  scroll-behavior: smooth;
}
</style>
