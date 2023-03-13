<template>
  <Transition>
    <slot></slot>
  </Transition>
</template>

<style>
.v-enter-active {
  transition: opacity 1.2s ease;
}
.v-leave-active {
  transition: opacity 0.15s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
