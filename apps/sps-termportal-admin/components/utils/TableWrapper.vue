<template>
  <section class="space-y-3">
    <h2 class="mb-3 text-xl"><slot name="header"></slot></h2>
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
