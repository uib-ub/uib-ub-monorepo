<template>
      <component :is="(level==1 || level == 9) ? 'div' : 'li'" :class="['definition', 'level'+level, {hilite: highlighted}]" :id="level != 9 && store.view == 'article' ? 'def' + body.id : ''"><component :is="level <= 2 ? 'div' : 'span'">
        <span class="explanations" v-if="explanations.length">
      <DefElement :body="explanation" :dict="dict" :has_article_ref=has_article_ref(explanation) v-for="(explanation, index) in explanations" :semicolon="might_need_semicolon(explanations, index)" :key="index" v-on:link-click="link_click" :content_locale="content_locale" :welcome="welcome"/>
    </span>
    <div v-if="examples.length && !welcome">
      <h5 v-if="level <3 && !body.sub_definition">{{$t('article.headings.examples', 1, { locale: content_locale})}}</h5>
      <ul class="examples">
        <Example :body="example" :dict="dict" v-for="(example, index) in examples" :key="index" v-on:link-click="link_click" :content_locale="content_locale" :semicolon="might_need_semicolon(examples, index)"/>
      </ul>
    </div>
    <ul class="compound_lists" v-if = "compound_lists.length">
      <CompoundList :dict="dict" v-for="(compound_list, index) in compound_lists" :body="compound_list" :key="index" v-on:link-click="link_click" :content_locale="content_locale" :welcome="welcome"/>
    </ul>
    <component :is="level < 3  && (body.elements[0].type_ == 'definition' || !subdefs[0].sub_definition) ? 'ol' : 'ul'" class="sub_definitions" v-if="subdefs.length">
      <Definition :def_number='index+1' :level="level+1" :body="subdef" v-for="(subdef, index) in subdefs"  :dict="dict" :semicolon="might_need_semicolon(subdefs, index)" :key="index" v-on:link-click="link_click" :content_locale="content_locale" :welcome="welcome"/>
    </component>
      </component>
      </component>

</template>


<script setup>
import { useStore } from '~/stores/searchStore'
import { useRoute } from 'vue-router'
const store = useStore()
const route = useRoute()

const props = defineProps({
    body: Object,
    level: Number,
    dict: String,
    def_number: Number,
    content_locale: String,
    welcome: Boolean
})


const highlighted = ref(false)


onMounted(() => {
  console.log('myheader mounted');
  if (route && route.hash && route.hash.slice(1) == 'def' + props.body.id) {
    highlighted.value = true
  }
});





const emit = defineEmits(['link-click'])
const link_click = (event) => {
    emit('link-click', event)
}

const explanations = computed(() => {
    return props.body.elements.filter(el => el.type_ == 'explanation')
})

const examples = computed(() => {
    return props.body.elements.filter(el => el.type_ == 'example')
})

const compound_lists = computed(() => {
    return props.body.elements.filter(el => el.type_ == 'compound_list')
})

const subdefs = computed(() => {
    return props.body.elements.filter(el => el.type_ == 'definition').filter(def => def.elements.filter(el => el.type_ != 'sub_article').length > 0)
})

const might_need_semicolon = (items, index) => {
  let n = items.length
  return n > 1 && n-1 > index
}


const has_article_ref = (item) => {
    return item.items.length && item.items[0].type_ == "article_ref" && item.items[0].definition_id === undefined ? true : false
}



</script>

<style scoped>

ul.examples {
  padding-left: 0rem;
}

.hilite {
  background: theme('colors.tertiary.darken1') !important;
  border-radius: 0.25rem;
}


  </style>
