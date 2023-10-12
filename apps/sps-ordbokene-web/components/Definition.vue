<template>
  <component :is="(level==1 || level == 9) ? 'div' : 'li'" :class="['definition', 'level'+level, {hilite: highlighted}]" :id="level != 9 && route.name == 'article' ? 'def' + body.id : undefined"><component :is="level <= 2 ? 'div' : 'span'">
  <div class="explanations" v-if="explanations.length">
    <!-- i-808 -->
    <div v-for="(explanation, index) in explanations" :key="index">
      <DefElement
        :body="explanation"
        :dict="dict"
        :has_article_ref="has_article_ref(explanation)"
        :semicolon="might_need_semicolon(explanations, index)"
        v-on:link-click="link_click"
        :content_locale="content_locale"
      />
      <br v-if="might_need_semicolon(explanations, index)" />
    </div>
    <!-- i/s -->
  </div>
<div v-if="examples.length">
  <h5 v-if="level <3 && !body.sub_definition">{{$t('article.headings.examples', 1, { locale: content_locale})}}</h5>
  <ul class="examples">
    <Example :body="example" :dict="dict" v-for="(example, index) in examples" :key="index" v-on:link-click="link_click" :content_locale="content_locale" :semicolon="might_need_semicolon(examples, index)"/>
  </ul>
</div>
<ul class="compound_lists" v-if = "compound_lists.length">
  <CompoundList :dict="dict" v-for="(compound_list, index) in compound_lists" :body="compound_list" :key="index" v-on:link-click="link_click" :content_locale="content_locale"/>
</ul>
<component :is="level < 3 && (body.elements[0].type_ == 'definition' || !subdefs[0].sub_definition) ? 'ol' : 'ul'" :class="{'sub_definitions': subdefs.length, 'single_sub_definition': subdefs.length === 1}" v-if="subdefs.length">  
  <Definition :def_number='index+1' :level="level+1" :body="subdef" v-for="(subdef, index) in subdefs"  :dict="dict" :semicolon="might_need_semicolon(subdefs, index)" :key="index" v-on:link-click="link_click" :content_locale="content_locale"/>
</component>
</component>
</component>

</template>


<script setup>
import { useSearchStore } from '~/stores/searchStore'
import { useRoute } from 'vue-router'
const store = useSearchStore()
const route = useRoute()

const props = defineProps({
body: Object,
level: Number,
dict: String,
def_number: Number,
content_locale: String,
})


const highlighted = ref(false)


onMounted(() => {
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
@apply pl-0;
}

.hilite {
@apply shadow !bg-tertiary-darken1;
}

.single_sub_definition{
  @apply list-disc ml-2;
  
}

</style>
