<template>
<client-only>
<div class="flex justify-around gap-3 mt-3 flex-wrap">
    <button class="btn btn-borderless" :id="'copy-link-'+article_id" v-if="showLinkCopy" @click="copy_link">
      <Icon :name="store.copied == 'copy-link-'+article_id ? 'bi:clipboard-check-fill' : 'bi:clipboard'" class="mr-3 mb-1 text-primary"/> {{$t("article.copy_link", 1, { locale: content_locale})}}
    <span aria-live="assertive" class="sr-only" v-if="'copy-citation-'+article_id == store.copied">{{$t('article.link_copied')}}</span></button>
    
    <button class="btn btn-borderless" v-if="webShareApiSupported" @click="shareViaWebShare">
      <Icon name="bi:share-fill" class="mr-3 mb-1 text-primary"/>{{$t("article.share", 1, { locale: content_locale})}}
    </button>
    <button class="btn btn-borderless" type="button" :aria-expanded="cite_expanded" :aria-controls="cite_expanded?  'cite-'+article_id : null" @click="cite_expanded = !cite_expanded">
      <Icon name="bi:quote" class="mr-3 mb-1 text-primary"/>{{$t("article.cite", 1, { locale: content_locale})}}
    </button>
</div>
<div class="cite-container p-4 pb-1 pt-2 mt-2" v-if="cite_expanded" :id="'cite-'+article_id">
      <h4>{{$t('article.cite_title')}}</h4>
      <p>{{$t("article.cite_description[0]", 1, { locale: content_locale})}}<em>{{$t('dicts.'+$props.dict)}}</em>{{$t("article.cite_description[1]", 1, { locale: content_locale})}}</p>
      <div id="citation" v-html="$t('article.citation', create_citation())" />
       <button class="mt-4 mb-2 btn btn-borderless" @click="copy_citation"><Icon v-if="copycitation" name="bi:file-earmark-plus" class="mb-1 mr-3 text-primary" /><Icon v-else name="bi:file-earmark-check-fill" class="mb-1 mr-3 text-primary" /> {{$t("article.copy")}}</button>
       <button class="mt-4 mb-2 btn btn-borderless" @click="download_ris"><Icon name="bi:download" class="mb-1 mr-3 text-primary" /> {{$t("article.download")}}</button>

</div>
</client-only>
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
      let link = create_link()
      
        navigator.clipboard.writeText(link).then(() => {
          console.log("SUCCESS")
          store.copied = event.target.id
         }).catch(err => {
           console.log("ERROR COPYING:",err)
         })
    }

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

const create_citation = () => {
      const [lemma, dd, mm, yyyy, link, dict] = get_citation_info()
      let citation = {lemma, link, dd, mm, yyyy, dict}

      return citation
    }

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

const copy_citation=()=>{

          let citation = document.getElementById("citation").textContent;
          navigator.clipboard.writeText(citation)
          copycitation.value = !copycitation.value;

          // this.citation_dialog = false
          // this.what_copied = this.$t("article.citation_copied")
          // this.copy_popup = true
          }


</script>

<style scoped>

.cite-container {
    border-radius: 1.5rem;
    @apply mt-4 duration-200 break-words border border-gray shadow-[4.0px_8.0px_8.0px_rgba(0,0,0,0.38)] ;
}

h4 {
  @apply text-primary text-2xl font-semibold;
  font-variant: all-small-caps;
  }
</style>