<template>
  <component :is="(level==1 || level == 9) ? 'div' : 'li'" :id="level != 9 && route.name == 'article' ? 'def' + body.id : undefined" :class="['definition', 'level'+level, {hilite: highlighted}]"><component :is="level <= 2 ? 'div' : 'span'">
  <div v-if="explanations.length" class="explanations">
    <!-- i-808 -->
    <div v-for="(explanation, index) in explanations" :key="index">
      <DefElement
        :body="explanation"
        :dict="dict"
        :has_article_ref="has_article_ref(explanation)"
        :semicolon="might_need_semicolon(explanations, index)"
        :scoped_locale="scoped_locale"
        @link-click="link_click"
      />
      <br v-if="might_need_semicolon(explanations, index)" />
    </div>
    <!-- i/s -->
  </div>
<div v-if="examples.length">
  <h5 v-if="level <3 && !body.sub_definition" :lang="locale2lang[scoped_locale]">{{$t('article.headings.examples', 1, { locale: scoped_locale})}}</h5>
  <ul class="examples">
    <Example v-for="(example, index) in examples" :key="index" :body="example" :dict="dict" :scoped_locale="scoped_locale" :semicolon="might_need_semicolon(examples, index)" @link-click="link_click"/>
  </ul>
</div>
<ul v-if = "compound_lists.length" class="compound_lists">
  <CompoundList v-for="(compound_list, index) in compound_lists" :key="index" :dict="dict" :body="compound_list" :scoped_locale="scoped_locale" @link-click="link_click"/>
</ul>
<component :is="level < 3 && (body.elements[0].type_ == 'definition' || !subdefs[0].sub_definition) ? 'ol' : 'ul'" :class="{'sub_definitions': subdefs.length, 'single_sub_definition': subdefs.length === 1}" v-if="subdefs.length">  
  <Definition v-for="(subdef, index) in subdefs" :key="index" :def_number='index+1' :level="level+1" :body="subdef"  :dict="dict" :semicolon="might_need_semicolon(subdefs, index)" :scoped_locale="scoped_locale" @link-click="link_click"/>
</component>
</component>
</component>

</template>


<script setup>
import { useRoute } from 'vue-router'
import { useSearchStore } from '~/stores/searchStore'
const store = useSearchStore()
const route = useRoute()

const props = defineProps({
  body: Object,
  level: Number,
  dict: String,
  def_number: Number,
  scoped_locale: String,
  semicolon: Boolean
})


const highlighted = ref(false)


onMounted(() => {
  if (route && route.hash && route.hash.slice(1) === 'def' + props.body.id) {
    highlighted.value = true
  }
});





const emit = defineEmits(['link-click'])
const link_click = (event) => {
emit('link-click', event)
}

const explanations = computed(() => {
return props.body.elements.filter(el => el.type_ === 'explanation')
})

const examples = computed(() => {
return props.body.elements.filter(el => el.type_ === 'example')
})

const compound_lists = computed(() => {
return props.body.elements.filter(el => el.type_ === 'compound_list')
})

const subdefs = computed(() => {
return props.body.elements.filter(el => el.type_ === 'definition').filter(def => def.elements.filter(el => el.type_ !== 'sub_article').length > 0)
})

const might_need_semicolon = (items, index) => {
const n = items.length
return n > 1 && n-1 > index
}


const has_article_ref = (item) => {
return item.items.length && item.items[0].type_ === "article_ref" && item.items[0].definition_id === undefined
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
