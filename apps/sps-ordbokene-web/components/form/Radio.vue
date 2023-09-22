<template>
    <span class="radiobox-container" @click="submit">
      <label class="grid">
        <input  class="" type="radio" :name="name" :value="value" :checked="current == value" @keyup="submit">
        <slot></slot>
      </label>
    </span>
    
</template>
    
<script setup>
    
  const props = defineProps({
      name: String,
      value: String,
      current: String
  })

  const emit = defineEmits(['submit'])
    
  const submit = event => {
    if (event.code == "Space" || event.type === 'click' && event.clientX !== 0 && event.clientY !== 0) {
      emit('submit', props.value)
    }
  }

    
    </script>
    
    
    <style scoped>
    
    input {
      accent-color: theme('colors.primary.DEFAULT');
    }

    input:checked:hover {
      accent-color: theme('colors.secondary.DEFAULT') !important;
    }

    

    *,
    *:before,
    *:after {
      @apply box-border;
    }

    label {
        grid-template-columns: 1em auto;
        @apply grid gap-2;
    }

    </style>