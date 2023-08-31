<template>
    <span class="radiobox-container" @click="submit">
      <Icon name="mdi:radiobox-marked" aria-hidden="true" class="text-primary absolute pointer-events-none w-6 h-6" v-if="current == value"/>
      <Icon name="mdi:radiobox-blank"  aria-hidden="true" class="text-gray-700 absolute pointer-events-none w-6 h-6" v-else/>
      
      <input  class="sr-only" type="radio" :id="labelId" :name="name" :value="value" @keyup="submit">
      <label class="pl-8" :for="props.labelId">
        <slot></slot>
      </label>
    </span>
    
</template>
    
<script setup>
    
  const props = defineProps({
      labelId: String,
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
      position: absolute;
    }
    
    input + label {
      display: block;
      position: relative;
    }
    
    input + label::before {
      content: '';

    }

    .radiobox-container:focus-within svg { 
  outline: solid 2px theme('colors.secondary.DEFAULT');
  border-radius: 1rem;

}


    
    

    
input:checked + label::after {
    content: '';
}
    

    </style>