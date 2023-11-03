<template>
  <li class="sub_article">
      <strong class="text-primary">
      {{body.lemmas[0]}}
      </strong>
      <div>
      <DefElement v-if="body.intro" :body="body.intro" :dict="dict" :scoped_locale="scoped_locale" @link-click="link_click" />
      <Definition :level="9" :body="body.article.body.definitions[0]" :dict="dict" :scoped_locale="scoped_locale" @link-click="link_click"/>
      </div>
  </li>
</template>
  
<script setup>

const props = defineProps({
    body: Object,
    dict: String,
    scoped_locale: String
})

const emit = defineEmits(['link-click'])
const link_click = (event) => {
    emit('link-click', event)
}

</script>

<style scoped>

li.sub_article {
  @apply pt-2;
}

li.sub_article ul {
  @apply pt-0;
}

ul li {
  @apply list-none;
}


</style>
    