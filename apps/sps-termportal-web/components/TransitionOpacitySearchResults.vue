<template>
  <Transition>
    <slot></slot>
  </Transition>
</template>

<style>
.v-enter-active {
  transition: opacity 0.5s ease;
}
.v-leave-active {
  transition: opacity 0.075s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
