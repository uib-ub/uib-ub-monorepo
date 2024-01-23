<template>
  <div class="bullet-point">
    <slot></slot>
  </div>
</template>

<style>
.bullet-point ul {
  text-indent: -1em;
  @apply list-disc;
}
</style>
