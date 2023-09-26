<template>
<div class="checkbox-container">
  <label>
<input  class="" type="checkbox" :checked="props.checked" v-model="model">
    <slot></slot>
  </label>
</div>

</template>

<script setup lang="ts">

const emit= defineEmits(['update:modelValue'])

const props = defineProps({
    checked: {
        type: Boolean,
        default: false
    }
})

const model = computed({
    get() {
        return props.checked
    },
    set(val) {
        emit('update:modelValue', val)
    }
})


</script>
<style scoped>

    input {
      accent-color: theme('colors.primary.DEFAULT');
    }

    input:checked:hover {
      accent-color: theme('colors.secondary.DEFAULT') !important;
    }


    label {
        display: grid;
        grid-template-columns: 1em auto;
        gap: 0.5em;
    }

</style>