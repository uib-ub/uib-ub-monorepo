<template>
  <li class="compound_list">
    <ul>
      <DefElement :body="body.intro" v-if="body.intro" :dict="dict" :content_locale="content_locale" :welcome="welcome"/>
      <li
        :key="index"
        v-for="(item, index) in body.elements"
        >{{' '}}<NuxtLink v-if="!welcome"
          :to="'/' + dict + '/' + item.article_id + (item.definition_id ? '#def'+item.definition_id : '')"
          @click="link_click(item)"
          >{{item.lemmas[0].lemma}}</NuxtLink><span v-else>{{item.lemmas[0].lemma}}</span>
      </li>
    </ul>
  </li>
</template>
<script setup>

const props = defineProps({
  body: Object,
  dict: String,
  content_locale: String,
  welcome: Boolean
})

const emit = defineEmits(['link-click'])
const link_click = (event) => {
  emit('link-click', event)
}

</script>

<style scoped>

li.compound_list ul li {
  @apply inline;
}

li.compound_list li:not(:last-child):not(:first-child):after {
  content: ",";
}

ul {
  @apply italic;
}
</style>
  