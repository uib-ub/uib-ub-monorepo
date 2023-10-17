<template>
<div class="checkbox-container">
  <label>
  <input type="checkbox" :checked="props.checked" v-model="model" :disabled="!cookies_accepted">
    <slot></slot>
  </label>
</div>

</template>

<script setup>
const emit= defineEmits(['update:modelValue'])
const cookies_accepted = useCookie("cookiesAccepted")

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
        grid-template-columns: 1em auto;
        @apply grid gap-2;
    }

</style>