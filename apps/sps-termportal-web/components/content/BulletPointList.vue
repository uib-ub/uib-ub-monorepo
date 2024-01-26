<template>
  <div class="bullet-point">
    <ContentSlot :use="$slots.default" unwrap="p" />
  </div>
</template>
