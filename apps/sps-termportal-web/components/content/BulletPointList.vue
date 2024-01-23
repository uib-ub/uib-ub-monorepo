<template>
  <div class="bullet-point">
    <slot></slot>
  </div>
</template>

<style>
.bullet-point ul {
  text-indent: -1em;
  padding-left: 1.5em;
  @apply list-disc;
}
</style>
