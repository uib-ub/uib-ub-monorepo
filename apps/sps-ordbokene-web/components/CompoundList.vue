<template>
  <li class="compound_list">
    <ul>
      <DefElement :body="body.intro" v-if="body.intro" :dict="dict" :scoped_locale="scoped_locale" />
      <li
        :key="index"
        v-for="(item, index) in body.elements"
        >{{' '}}<NuxtLink
          :to="`/${$i18n.locale}/${dict}/${item.article_id}${item.definition_id ? '#def'+item.definition_id : ''}`"
          @click="link_click(itemref)"
          >{{item.lemmas[0].lemma}}</NuxtLink>
      </li>
    </ul>
  </li>
</template>
<script setup>

const props = defineProps({
  body: Object,
  dict: String,
  scoped_locale: String,
})

const emit = defineEmits(['link-click'])
const link_click = (itemref) => {
  emit('link-click', itemref)
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
  