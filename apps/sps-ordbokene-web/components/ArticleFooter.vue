<template>
<div class="flex mt-4 mb-4 md:mb-0 flex-wrap gap-y-6">
  <client-only>
    <div role="toolbar" class="flex justify-center sm:justify-normal gap-2 flex-wrap gap-y-2">
    <button v-if="showLinkCopy" class="btn btn-borderless px-3" @click="copy_link" v-bind:class="{'hidden xl:block': store.dict == 'bm,nn' && $route.name!= 'article', 'hidden md:block': store.dict != 'bm,nn' && $route.name != 'article'}">
      <Icon :name="store.copied == create_link() ? 'bi:clipboard-check-fill' : 'bi:clipboard'" class="mr-3 mb-1 text-primary"/>
      <span>{{ store.copied == create_link() ? $t('article.link_copied') : $t('article.copy_link', 1, { locale: content_locale }) }} </span>
    </button>
    <button class="btn btn-borderless px-3" v-if="webShareApiSupported" @click="shareViaWebShare">
        <Icon name="bi:share-fill" class="mr-3 mb-1 text-primary"/>{{$t("article.share", 1, { locale: content_locale})}}
    </button>
      <button class="btn btn-borderless px-3" type="button" :aria-expanded="cite_expanded" :aria-controls="cite_expanded?  'cite-'+article_id : null" @click="cite_expanded = !cite_expanded">
        <Icon name="bi:quote" class="mr-3 mb-1 text-primary"/>{{$t("article.cite", 1, { locale: content_locale})}}
      </button>
      <div class="cite-container p-4 pb-1 pt-2 relative text-1 basis-full" v-if="cite_expanded" :id="'cite-'+article_id">
        <h4>{{$t('article.cite_title')}}</h4>
        <p>{{$t("article.cite_description[0]", 1, { locale: content_locale})}}<em>{{$t('dicts.'+$props.dict)}}</em>{{$t("article.cite_description[1]", 1, { locale: content_locale})}}</p>

        <div class="bg-tertiary-darken1 px-2 pt-1 pb-3 my-2 break-all sm:break-words">
          <i18n-t keypath="article.citation" tag="div" id="citation">
            <template v-slot:lemma>{{citation.lemma}}</template>>
            <template v-slot:link>
              &lt;<a :href="citation.link">{{citation.link}}</a>&gt;
            </template>
            <template v-slot:dict>
              <em>{{citation.dict}}</em>
            </template>
            <template v-slot:dd>
              {{citation.dd}}
            </template>
            <template v-slot:mm>
              {{citation.mm}}
            </template>
            <template v-slot:yyyy>
              {{citation.yyyy}}
            </template>
          </i18n-t>

        </div>
          <button class="mt-4 mb-2 btn btn-borderless" @click="copy_citation">
            <Icon :name="copycitation ? 'bi:file-earmark-plus' : 'bi:file-earmark-check-fill'" class="mb-1 mr-3 text-primary" />{{ citationCopied ? $t('article.citation_copied') : $t('article.copy') }}
          </button>
          <button class="mt-4 mb-2 btn btn-borderless" @click="download_ris"><Icon name="bi:download" class="mb-1 mr-3 text-primary" /> {{$t("article.download")}}</button>
    </div>
    </div>
  </client-only>

<span v-if="$route.name != 'article'" class="px-4 pt-1 ml-auto">
    <NuxtLink class="whitespace-nowrap"  :to="`/${dict}/${article_id}`">
       <span>{{$t("article.open", 1, { locale: content_locale})}}</span>
    </NuxtLink>
    </span>
    
</div>
  


</template>

<script setup>

import { useStore } from '~/stores/searchStore'
const store = useStore()

const props = defineProps({
    lemmas: Array,
    dict: String,
    article_id: Number,
    content_locale: String
})

const cite_expanded = ref(false)
const citationCopied = ref(false);


const create_link = () => {
      return `https://ordbokene.no/${props.dict}/${props.article_id}`
    };

const webShareApiSupported = computed(() => {
  return navigator.share
})

const showLinkCopy = computed(() => {
  return navigator.clipboard
})

const shareViaWebShare = () => {
        navigator.share({
        title: "Ordbøkene.no: " + props.lemmas[0].lemma,
        text: "",
        url: "/" + props.dict + '/' + props.article_id
      })
      };


const copy_link = (event) => {
  let link = create_link();
  navigator.clipboard.writeText(link).then(() => {
    store.copied = link;
  }).catch(err => {
    console.log("ERROR COPYING:", err);
  });
};

const get_citation_info = () => {
      let date = new Date();
      let dd = (date.getDate() < 10? '0' : '') + date.getDate()
      let mm = (date.getMonth() < 9? '0' : '') + (date.getMonth()+1)
      let yyyy = date.getFullYear()
      let link = create_link()
      let lemma = props.lemmas[0].lemma
      let dict = {"bm":"Bokmålsordboka", "nn":"Nynorskordboka"}[props.dict]
      return [lemma, dd, mm, yyyy, link, dict]
    }

const citation = computed(() => {
      const [lemma, dd, mm, yyyy, link, dict] = get_citation_info()
      let citation = {lemma, link, dd, mm, yyyy, dict}

      return citation
    })

const download_ris = () => {
      const [lemma, dd, mm, yyyy, link] = get_citation_info()
      const a = document.createElement("a")
      a.style = "display: none"
      a.setAttribute("download", `${lemma}_${props.dict}.ris`)
      const dict = {"bm":"Bokmålsordboka", "nn": "Nynorskordboka"}[props.dict]
      const text = `TY  - DICT\nTI  - ${lemma}\nT2  - ${dict}\nPB  - Språkrådet og Universitetet i Bergen\nUR  - ${link}\nY2  - ${yyyy}/${mm}/${dd}/\nER  - `
      a.setAttribute('href', 'data:application/x-research-info-systems;charset=utf-8,' + encodeURIComponent(text));
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }

const copycitation = ref(true);

const copy_citation = () => {
  let citation = document.getElementById("citation").textContent;
  navigator.clipboard.writeText(citation);
  copycitation.value = !copycitation.value;
  citationCopied.value = !citationCopied.value; // Toggle the citationCopied value
};


</script>

<style scoped>

.cite-container {
    border-radius: 1.5rem;
    @apply mt-4 duration-200 border border-gray shadow-[4.0px_8.0px_8.0px_rgba(0,0,0,0.38)] ;
}


h4 {
  @apply text-primary text-2xl font-semibold;
  font-variant: all-small-caps;
  }

</style>