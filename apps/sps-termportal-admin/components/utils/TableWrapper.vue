<template>
  <section class="space-y-3">
    <AppLink :to="'#' + id">
      <component
        :is="headingLevel"
        :id="id"
        :class="`mb-3 ${headingTextClass}`"
      >
        <slot name="header" />
      </component>
    </AppLink>
    <div class="space-y-3">
      <div class="space-y-1.5 max-w-3xl">
        <slot name="description" />
      </div>
      <slot />
      <div class="space-y-3 max-w-3xl">
        <slot name="legend" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { v4 as uuid } from "uuid";

const appConfig = useAppConfig();
const headingTextClassOptions = appConfig.ui.headingTextClassOptions;

const props = defineProps<{
  headingLevel: HeadingLevelWithDefaultOptions;
  headingClass?: string;
}>();

const id = uuid();

const headingTextClass = computed(() => {
  if (!props.headingClass) {
    return headingTextClassOptions[props.headingLevel];
  }
  return props.headingClass;
});
</script>
