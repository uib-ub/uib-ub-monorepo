<template>
  <div role="status">
    <Icon
      class="tp-spin"
      name="icomoon-free:spinner8"
      size="1.5em"
      aria-hidden="true"
    />
    <span class="sr-only">{{ $t("spinnerIcon.srText") }}</span>
  </div>
</template>

<style scoped>
.tp-spin {
  animation-name: spin;
  animation-duration: 2s;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
