<template>
    <div class="w-full collapsible-container">
    <component :id="id" :is="is || 'div'"><button class="p-2 mt-4 text-left w-full"
                                               @click="expanded = !expanded" 
                                               :aria-expanded="expanded"
                                               :aria-controls="props.id + '-content'">
                                               <Icon class="mr-4 ml-1 text-gray-700" :name="expanded ? 'bi:chevron-up' : 'bi:chevron-down'"/>{{header}}
                                        </button></component>


    

  
        <div  :hidden="expanded ? null : 'until-found'" :id="id+ '-content'" class="expanding" v-bind:class="{'mb-8': expanded}">
      <slot></slot>
    </div>
    </div>
</template>

<script setup lang="ts">


import { useRoute } from 'vue-router'
const route = useRoute()

const props = defineProps({
    is: String,
    header: String,
    id: String
})


const expanded = ref(false) //route.hash == '#'+props.id




</script>


<style scoped>

button {
    @apply text-text pt-2 pb-3 duration-200 ease-in-out;
    font-size: 1.17em;

}

.collapsible-container:not(:last-child) {
    border-bottom: solid 1px theme('colors.gray.100');
    
}

button:active, button:focus {
    @apply bg-tertiary-darken1
}

button[aria-expanded=true] {
    @apply bg-tertiary-darken2;

}

h4 i {
    @apply text-primary
}

h3 i {
    @apply text-gray-700;
}





</style>