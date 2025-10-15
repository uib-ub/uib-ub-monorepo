<template>
  <section class="space-y-3">
    <div class="flex">
      <AppLink :to="'#' + id">
        <component
          :is="headingLevel"
          :id="id"
          :class="`mb-3 ${headingTextClass}`"
        >
          <slot name="header" />
        </component>
      </AppLink>
      <IconSpinner
        v-if="pending || true"
        class="ml-2 mb-1.5"
        size="1.1em"
      />
    </div>

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
  pending?: boolean;
}>();

const id = uuid();

const headingTextClass = computed(() => {
  if (!props.headingClass) {
    return headingTextClassOptions[props.headingLevel];
  }
  return props.headingClass;
});
</script>
