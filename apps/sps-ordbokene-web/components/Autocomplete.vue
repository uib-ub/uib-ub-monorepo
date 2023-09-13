<script setup>
import { useStore } from '~/stores/searchStore'
import { useRoute } from 'vue-router'
import {useSettingsStore } from '~/stores/settingsStore'

const store = useStore()
const route = useRoute()
const settings = useSettingsStore()

const input_element = useState('input_element')

const top_option = ref()

const close_dropdown = () => {
  store.dropdown_selected = -1
  store.show_autocomplete = false

}

async function fetchAutocomplete(q) {

  q = q.trim()
    if (q.length == 0) {
      store.show_autocomplete = false;
      return
    }

    const pattern = advancedSpecialSymbols(q)
    const hasOr = q.includes("|")
    const time = Date.now()
    if (pattern && (!store.autocomplete[0] || store.autocomplete[0].time < time)) {
      store.autocomplete = [{q, time, type: "pattern"}]
      store.show_autocomplete = true;
    }
    else if (hasOr) {
      store.autocomplete = []
      store.show_autocomplete = false;
    }
    
       


    // Intercept queries containing too many words or characters
    let words = q.split(/ |\|/)
    if (words.length > 20) {
      store.autocomplete = []
      store.show_autocomplete = false;
      return
    }
    for (let i = 0; i < words.length; i++) {
      if (words[i].length > 40) {
        store.autocomplete = []
        store.show_autocomplete = false;
        return
      }
    }

    if (!pattern && !hasOr) {

      let response = ref([])
      let url = `${store.endpoint}api/suggest?&q=${q}&dict=${store.dict}&n=20&dform=int&meta=n&include=${route.name != 'search' ? store.scope + (store.pos ? '&wc='+store.pos : '') : 'ei'}`
      response.value = await $fetch(url)

      // prevent suggestions after submit
      if (q == store.input) {
        store.suggest = response.value.a
        let autocomplete_suggestions = []
        if (store.input.trim() == q && response.value.a.exact) {
          let { exact, inflect, freetext } = response.value.a
          autocomplete_suggestions = exact.map(item => ({q: item[0], time: time, dict: [item[1]], type: "word"}))
          if (inflect) {
            let inflection_suggestions = response.value.a.inflect.map(item => ({q: item[0], time: time, dict: [item[1]], type: "inflect"}))
            autocomplete_suggestions = autocomplete_suggestions.concat(inflection_suggestions)
          }
          if (freetext) {
            let inflection_suggestions = response.value.a.freetext.map(item => ({q: item[0], time: time, dict: [item[1]], type: "freetext"}))
            autocomplete_suggestions = autocomplete_suggestions.concat(inflection_suggestions)
          }
        }

        if (autocomplete_suggestions.length && store.input.trim() == q && q != store.q) {

          store.autocomplete = autocomplete_suggestions
          store.show_autocomplete = true;
        }
        else {
          store.show_autocomplete = false
        }


      }
    }
}


const emit = defineEmits(['dropdown-submit'])


const clearText = () => {
  store.input = ""
  input_element.value.select()
}




const keys = (event) => {
  
  if (store.show_autocomplete) {
    if (event.key == "ArrowDown" || event.key == "Down") {
    
    if (store.dropdown_selected <  store.autocomplete.length -1) {
      store.dropdown_selected += 1;
    }
    else {
      store.dropdown_selected = 0;      
    }
    
    store.input = store.autocomplete[store.dropdown_selected].q

    //event.stopPropagation()
    event.preventDefault()
  }
  else if (event.key == "ArrowUp" || event.key == "Up") {
    if (store.dropdown_selected > -1) {
    
    store.dropdown_selected -= 1;

    if (store.dropdown_selected > -1) {
    store.input = store.autocomplete[store.dropdown_selected].q
    
    }
    
    }
    //event.stopPropagation()
    event.preventDefault()
  }
  else if (event.key == "Escape" || event.key == "Esc") {
    close_dropdown()
  }
  else if (event.key == "Home" && store.dropdown_selected > -1) {
    store.dropdown_selected = 0
    event.preventDefault()

  }
  else if (event.key == "End" && store.dropdown_selected > -1) {
    store.dropdown_selected = store.autocomplete.length - 1
    event.preventDefault()

  }
  else if (event.key != "Enter") {
    store.dropdown_selected = -1
  }

 

    // Scroll if necessary
    if (process.client && store.dropdown_selected > -1) {
        document.getElementById('autocomplete-item-'+store.dropdown_selected).scrollIntoView({block: 'nearest'})
      }
  }

}

const input_sync = (event) => {
  store.input = event.target.value
  fetchAutocomplete(store.input)
  if (event.target.value) {
    input_element.value.setAttribute('value', event.target.value)
  }
  else {
    input_element.value.removeAttribute('value')
  }
}

const dropdown_select = (q) => {
  store.input= q
  store.show_autocomplete = false
  emit('dropdown-submit', q)
}


const exit_input = event => {
  if (!(event.relatedTarget && event.relatedTarget.hasAttribute('data-dropdown-item'))) {
    store.show_autocomplete = false
  }
}

if (process.client) {
  document.addEventListener('keyup', (e) => {
    if (e.key === "/") {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (/^(?:input|textarea|select)$/i.test(e.target.tagName)) return;
    if(e.shiftKey && input_element.value) {
      input_element.value.select()
      input_element.value.scrollIntoView({block: 'end'})
      e.preventDefault()
    }
    }

    if (e.key === "Esc" || e.key == "Escape") {
      store.show_autocomplete == false 
      store.dropdown_selected = -1
    }
    
  })


}




</script>

<template>
  <div class="search-container">
  <div class="input-wrapper h-3.5rem border bg-canvas border-primary flex content-center justify-between pr-2" v-bind="{'data-dropdown-open': store.show_autocomplete}">
   <input class="input-element p-3 pl-6 lg:p-4 lg:px-8"
          :value="store.input"
          id="input-element"
          ref="input_element" 
          @input="input_sync"
          @blur="close_dropdown"
          role="combobox" 
          name="q"
          :aria-activedescendant="store.dropdown_selected >= 0 ? 'autocomplete-item-'+store.dropdown_selected : null"
          aria-autocomplete="list"
          aria-haspopup="listbox"
          maxlength="200"
          enterkeyhint="search"
          :aria-label="$t('search_placeholder') + $t(`dicts_inline.${store.dict}`)"
          :placeholder="$t('search_placeholder') + $t(`dicts_inline.${store.dict}`)"
          autocomplete="off"
          autocapitalize="none"
          @keydown="keys"
          :aria-expanded="store.show_autocomplete || 'false'" 
          :aria-owns="store.dropdown_selected >= 0 ? 'autocomplete-dropdown' : null"/>
          <button type="button" :title="$t('clear')" class="appended-button" v-if="store.input.length > 0" :aria-label="$t('clear')" v-on:click="clearText"><Icon name="bi:x-lg" size="1.25em"/></button>
          <button class="appended-button" type="submit" :aria-label="$t('search')"><Icon name="bi:search" size="1.25em"/></button>
          

  </div>
  <div class="dropdown-wrapper" v-if="store.show_autocomplete">
   <ul id="autocomplete-dropdown" role="listbox" ref="autocomplete_dropdown">
    <li v-for="(item, idx) in store.autocomplete"
        :key="idx" 
        :aria-selected="idx == store.dropdown_selected"
        role="option"
        tabindex="-1"
        :lang="['bm','nn','no'][item.dict-1]"
        :id="'autocomplete-item-'+idx">
        <div class="dropdown-item w-full" data-dropdown-item tabindex="-1" @click="dropdown_select(item.q)">
          <span v-if="item.type == 'pattern' && route.name != 'search'" role="status" aria-live="polite" class=" bg-primary text-white p-1 rounded px-3 ml-3">{{$t('to_advanced')}} 
            <Icon name="bi:arrow-right"/>
          </span>
          <span v-else :aria-live="store.autocomplete.length == 1? 'polite' : null">
            <span v-if="store.autocomplete.length == 1" class="sr-only">{{$t('autocomplete_suggestions', 1)}}: </span>
            <span :class="item.type">{{ item.q }}</span> <span class="dict-parentheses text-gray-900" v-if="item.dict && store.dict =='bm,nn'">({{["bokmål","nynorsk","bokmål, nynorsk"][item.dict-1]}})</span>
          </span>
        </div>
   </li>
  </ul>
  <div v-if="store.autocomplete.length > 1" class="font-normal text-primary text-right px-6 pt-2" :key="store.input" role="status" aria-live="polite">
    {{store.autocomplete.length}} {{$t('autocomplete_suggestions', 0)}}<span class="text-gray-600" v-if="store.autocomplete.length == 20"> ({{$t('maximum_autocomplete')}})</span></div>
 </div>
  </div>


</template>


<style scoped>

.search-container {
  position: relative;
  left: 50%;
transform: translateX(-50%);
  @apply duration-200;
}

.dropdown-wrapper {
  position: absolute;
  width: 100%;
  z-index: 1000;
  left: 0;
  border-radius: 0 0 2rem 2rem ;
  padding-bottom: .75rem;
  padding-left: .5rem;
  border-left: 1px solid;
  border-right: 1px solid;
  border-bottom: 1px solid;   
  box-shadow: 2px 2px 0px theme("colors.primary.DEFAULT");

  @apply border-primary bg-canvas block ;
}


#autocomplete-dropdown {
  overflow-y: auto;
  max-height: 50vh;
  @apply px-0 mx-0 flex flex-col;
}


#autocomplete-dropdown li {
  position: relative;
  width: calc(100% - 1rem);
}


#autocomplete-dropdown .dropdown-item {
  text-align: left;
  @apply p-2 mx-2;


}

 #autocomplete-dropdown .word {
    @apply text-primary;
    font-weight: bolder;
}

#autocomplete-dropdown li:not(:last-child) .dropdown-item {
  border-bottom: solid 1px;
  @apply border-gray-300;

}

#autocomplete-dropdown li[aria-selected=true] .dropdown-item {
  @apply bg-gray-50;
}

#autocomplete-dropdown .dropdown-item:hover  {
    @apply bg-canvas-darken;
    cursor: pointer;
}


.dict-parentheses {
    font-size: 85%;
    font-weight: 400;
}

.input-wrapper {
    width: 100%;
    border-radius: 2rem;
    box-shadow: unset;
}


  .input-wrapper:focus-within, .input-wrapper[data-dropdown-open=true] {
  box-shadow: 2px 2px 0 theme("colors.primary.DEFAULT");
}


.input-element {
  border-radius: 2rem 0 0 2rem;
  background: none;
  outline: none;
  width: 100%;
  

}

.input-wrapper {
    width: 100%;
    border-radius: 2rem;
}

.input-wrapper[data-dropdown-open=true] {
  border-radius: 1.75rem 1.75rem 0 0;
  border-bottom: none;
  padding-bottom: 1px;
}




::-webkit-scrollbar {
  width: 1rem;
  border-radius: 0 0 1rem 0;
}
::-webkit-scrollbar-track {
  background: #ffff;
  border-radius: 0 0 1rem 0;
}
::-webkit-scrollbar-thumb {
  @apply bg-gray-300;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-400;
}



.appended-button, .appended-button-disabled {
  @apply text-primary m-0 p-2 self-center;
  border: none;
  border-radius: 2rem; 
  background: unset;
  display: flex;

}


  
.appended-button:hover, .appended-button:active {
  @apply bg-primary text-canvas duration-200;
  }


.advanced-search .appended-button  {
  font-size: 1.25rem;
}




</style>
