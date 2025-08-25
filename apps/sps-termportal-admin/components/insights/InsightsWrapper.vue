<template>
  <section class="space-y-3">
    <h2 class="mb-3 text-xl">
      <slot name="header" />
    </h2>
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
