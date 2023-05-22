<template>
<div class="checkbox-container">
  <Icon name="mdi:checkbox-marked" aria-hidden="true" class="text-primary absolute pointer-events-none w-[1.5rem] h-[1.5rem]" v-if="checked"/>
  <Icon name="mdi:checkbox-blank-outline"   aria-hidden="true" class="text-gray-700 absolute pointer-events-none w-[1.5rem] h-[1.5rem]" v-else/>
<input  class="sr-only" type="checkbox" :id="props.labelId" :checked="props.checked" v-model="model">
  <label class="pl-8" :for="props.labelId">
    <slot></slot>
  </label>
</div>

</template>

<script setup lang="ts">

const emit= defineEmits(['update:modelValue'])

const props = defineProps({
    labelId: String,
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
.checkbox-container:focus-within svg { 
  outline: solid 2px theme('colors.secondary.DEFAULT');
  border-radius: .125rem;

}
</style>