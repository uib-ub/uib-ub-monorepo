<template>
      <div @blur="expanded=false">
        <button ref="toggle_ref" aria-controls="locale_select" @click="expanded = !expanded">
          <slot  name="button" :expanded="expanded"/>
        </button>
        <div >
        <div :id="id"  v-bind:class="{hidden: !expanded}">
          <slot/>
        </div>
      </div>
      </div>

</template>

<script setup>
const expanded = ref(false)
const toggle_ref = ref(null)

const props = defineProps({
  id: String
})


if (process.client) {
    document.addEventListener('keyup', (e) => {
        if (e.key == "Escape" || e.key == "Esc") {
        expanded.value = false
    }
    })

    document.addEventListener('click', (e) => {
        if (e.target != toggle_ref.value) {
          expanded.value = false
        }
    })
}


</script>