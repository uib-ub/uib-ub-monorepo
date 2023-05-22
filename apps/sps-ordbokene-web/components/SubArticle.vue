<template>
<li class="sub_article">
    <strong class="text-primary">
    {{body.lemmas[0]}}
    </strong>
    <div>
    <DefElement :body="body.intro" v-if="body.intro" :dict="dict" @link-click="link_click" :content_locale="content_locale"/>
    <Definition :level="9" :body="body.article.body.definitions[0]" :dict="dict" @link-click="link_click" :content_locale="content_locale"/>
    </div>
</li>
</template>

<script setup>

const props = defineProps({
    body: Object,
    dict: String,
    content_locale: String
})

const emit = defineEmits(['link-click'])
const link_click = (event) => {
    emit('link-click', event)
}

</script>

<style scoped>

li.sub_article {
  padding-top: 8px;
}

li.sub_article ul {
  padding-top: 0px;
}

ul li {
  list-style:none;
}


</style>
    