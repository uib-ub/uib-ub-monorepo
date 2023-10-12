<script setup>
import { useSearchStore } from '~/stores/searchStore'
import { useRoute } from 'vue-router'
import {useSettingsStore } from '~/stores/settingsStore'
import {useSessionStore } from '~/stores/sessionStore'

const store = useSearchStore()
const route = useRoute()
const settings = useSettingsStore()
const session = useSessionStore()

const input_element = useState('input_element')

const top_option = ref()

const close_dropdown = () => {
  session.dropdown_selected = -1
  session.show_autocomplete = false

}

async function fetchAutocomplete(q) {

  q = q.trim()
    if (q.length == 0) {
      session.show_autocomplete = false;
      return
    }

    const pattern = advancedSpecialSymbols(q)
    const hasOr = q.includes("|")
    const time = Date.now()
    if (pattern && (!store.autocomplete[0] || store.autocomplete[0].time < time)) {
      store.autocomplete = [{q, time, type: "pattern"}]
      session.show_autocomplete = true;
    }
    else if (hasOr) {
      store.autocomplete = []
      session.show_autocomplete = false;
    }
    
       


    // Intercept queries containing too many words or characters
    let words = q.split(/ |\|/)
    if (words.length > 20) {
      store.autocomplete = []
      session.show_autocomplete = false;
      return
    }
    for (let i = 0; i < words.length; i++) {
      if (words[i].length > 40) {
        store.autocomplete = []
        session.show_autocomplete = false;
        return
      }
    }

    if (!pattern && !hasOr) {

      let response = ref([])
      let url = `${session.endpoint}api/suggest?&q=${q}&dict=${store.dict}&n=20&dform=int&meta=n&include=${route.name == 'search' ? store.scope + (store.pos ? '&wc='+store.pos : '') : 'ei'}`
      response.value = await $fetch(url)

      // prevent suggestions after submit
      if (q == store.input) {
        store.suggest = response.value.a
        let autocomplete_suggestions = []
        if (store.input.trim() == q && response.value.a.exact) {
          let { exact, inflect, freetext } = response.value.a
          const seen = new Set()
          exact.forEach(item => {
            autocomplete_suggestions.push({q: item[0], time: time, dict: [item[1]], type: "word"})
            seen.add(item[0])
          });
          if (inflect) {
            inflect.forEach(item => {
            if (!seen.has(item[0])) {
              autocomplete_suggestions.push({q: item[0], time: time, dict: [item[1]], type: "inflect"})
              seen.add(item[0])
            }
            });
          }
          if (freetext) {
            freetext.forEach(item => {
            if (!seen.has(item[0])) {
              autocomplete_suggestions.push({q: item[0], time: time, dict: [item[1]], type: "freetext"})
              seen.add(item[0])
            }
            });
          }
        }

        if (autocomplete_suggestions.length && store.input.trim() == q && q != store.q) {

          store.autocomplete = autocomplete_suggestions
          session.show_autocomplete = true;
        }
        else {
          session.show_autocomplete = false
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
  
  if (session.show_autocomplete) {
    if (event.key == "ArrowDown" || event.key == "Down") {
    
    if (session.dropdown_selected <  store.autocomplete.length -1) {
      session.dropdown_selected += 1;
    }
    else {
      session.dropdown_selected = 0;      
    }
    
    store.input = store.autocomplete[session.dropdown_selected].q

    event.preventDefault()
  }
  else if (event.key == "ArrowUp" || event.key == "Up") {
    if (session.dropdown_selected > -1) {
    
    session.dropdown_selected -= 1;

    if (session.dropdown_selected > -1) {
    store.input = store.autocomplete[session.dropdown_selected].q
    
    }
    
    }
    event.preventDefault()
  }
  else if (event.key == "Escape" || event.key == "Esc" || event.key == "Tab") {
    close_dropdown()
  }
  else if (event.key == "Home" && session.dropdown_selected > -1) {
    session.dropdown_selected = 0
    event.preventDefault()

  }
  else if (event.key == "End" && session.dropdown_selected > -1) {
    session.dropdown_selected = store.autocomplete.length - 1
    event.preventDefault()

  }
  else if (event.key != "Enter") {
    session.dropdown_selected = -1
  }

 

    // Scroll if necessary
    if (process.client && session.dropdown_selected > -1) {
        document.getElementById('autocomplete-item-'+session.dropdown_selected).scrollIntoView({block: 'nearest'})
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
  session.show_autocomplete = false
  emit('dropdown-submit', q)
}


const exit_input = event => {
  if (!(event.relatedTarget && event.relatedTarget.hasAttribute('data-dropdown-item'))) {
    session.show_autocomplete = false
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
      session.show_autocomplete == false 
      session.dropdown_selected = -1
    }
    
  })


}




</script>

<template>
  <div class="search-container">
  <div class="input-wrapper h-3.5rem border bg-canvas border-primary flex content-center justify-between pr-2" v-bind="{'data-dropdown-open': session.show_autocomplete}">
   <input class="input-element p-3 pl-6 lg:p-4 lg:px-8"
          type="text"
          :value="store.input"
          id="input-element"
          ref="input_element" 
          @input="input_sync"
          role="combobox" 
          name="q"
          :aria-activedescendant="session.dropdown_selected >= 0 ? 'autocomplete-item-'+session.dropdown_selected : null"
          aria-autocomplete="list"
          aria-haspopup="listbox"
          maxlength="200"
          enterkeyhint="search"
          :aria-label="$t('search_placeholder') + $t(`dicts_inline.${store.dict}`)"
          :placeholder="$t('search_placeholder') + $t(`dicts_inline.${store.dict}`)"
          autocomplete="off"
          autocapitalize="none"
          @keydown="keys"
          :aria-expanded="session.show_autocomplete || 'false'" 
          :aria-owns="session.dropdown_selected >= 0 ? 'autocomplete-dropdown' : null"/>
          <button v-if="store.input.length > 0" type="button" :title="$t('clear')" class="appended-button" :aria-label="$t('clear')" @click="clearText"><Icon name="bi:x-lg" size="1.25em"/></button>
          <button type="submit" class="appended-button"  :aria-label="$t('search')"><Icon name="bi:search" size="1.25em"/></button>
          

  </div>
  <client-only>
  <div class="dropdown-wrapper" v-if="session.show_autocomplete">
   <ul id="autocomplete-dropdown" role="listbox" ref="autocomplete_dropdown">
    <li v-for="(item, idx) in store.autocomplete"
        :key="idx" 
        :aria-selected="idx == session.dropdown_selected"
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
            <span :class="item.type">{{ item.q }}</span> <span v-if="item.dict && store.dict =='bm,nn'" class="dict-parentheses text-gray-900">({{["bokmål","nynorsk","bokmål, nynorsk"][item.dict-1]}})</span>
          </span>
        </div>
   </li>
  </ul>
 </div>
  </client-only>
  </div>


</template>


<style scoped>

.search-container {
  left: 50%;
transform: translateX(-50%);
@apply relative;
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
  max-height: 50vh;
  @apply px-0 mx-0 flex flex-col overflow-y-auto;
}


#autocomplete-dropdown li {
  position: relative;
  width: calc(100% - 1rem);
}


#autocomplete-dropdown .dropdown-item {
  @apply p-4 mx-2 duration-200 motion-reduce:transition-none text-left;
}
#autocomplete-dropdown .dropdown-item:hover  {
    @apply bg-canvas-darken cursor-pointer shadow-md;
}


 #autocomplete-dropdown .word {
    @apply text-primary font-black;
}

#autocomplete-dropdown li:not(:last-child) .dropdown-item {
  @apply border-gray-300 border-b border-gray-700;

}

#autocomplete-dropdown li[aria-selected=true] .dropdown-item {
  @apply bg-gray-50;
}



.dict-parentheses {
    font-size: 85%;
    @apply font-normal;
}

.input-wrapper {
    box-shadow: unset;
    @apply w-full rounded-[2rem];
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
  @apply bg-white;
  border-radius: 0 0 1rem 0;
}
::-webkit-scrollbar-thumb {
  @apply bg-gray-300 rounded-[10px];
  /* border-radius: 10px; */
}
::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-400;
}



.appended-button, .appended-button-disabled {
  @apply text-primary m-0 p-2 self-center flex motion-reduce:transition-none border-none;
  border-radius: 2rem; 
  background: unset;

}


  
.appended-button:hover, .appended-button:active {
  @apply bg-primary text-canvas duration-200;
  }


.advanced-search .appended-button  {
  @apply text-xl;
}




</style>
