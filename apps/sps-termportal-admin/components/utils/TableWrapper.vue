<template>
  <section class="space-y-3">
    <AppLink :to="'#' + id">
      <component :is="headingLevel" :id="id" class="mb-3 text-xl"
        ><slot name="header"></slot
      ></component>
    </AppLink>
    <div class="space-y-3">
      <div class="space-y-1.5 max-w-3xl">
        <slot name="description"></slot>
      </div>
      <slot></slot>
      <div class="space-y-3 max-w-3xl">
        <slot name="legend"></slot>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { v4 as uuid } from "uuid";

const props = defineProps({ headingLevel: { type: String, default: "h2" } });

const id = uuid();
</script>
