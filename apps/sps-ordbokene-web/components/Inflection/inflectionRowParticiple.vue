<template>
    <tr>
      <td v-for="([prefix, [rowspan,rowindex,forms], suffix, headers], index) in rows"
          :key="index"
          class="notranslate infl-cell"
          :rowspan="rowspan"
          :headers="headers"
          :class="{hilite: $parent.highlighted(rowindex, lemmaId)}"
           @mouseover="$emit('hilite', rowindex, lemmaId)"
           @mouseleave="$emit('unhilite')">
        <span v-for="(form, index2) in forms"
              :key="index2"
              class='comma'>
          <em v-if="prefix" class="context">{{prefix}}</em>
          {{form}}
          <em v-if="suffix" class="context nobr" translate="yes" :lang="langTag">{{suffix}}</em>
        </span>
      </td>
      
    </tr>
</template>
    
<script>

// needed for hiliting


import { inflectedForm, indefArticle
        } from './mixins/ordbankUtils.js' 

export default {
    name: 'inflectionRowParticiple',
    props: ['paradigm','hasPerfPart','dict', 'locale', 'langTag', 'part','lemmaId', 'context'],
    data: function () {
        return { rows: [
            this.hasPerfPart && this.part !== 4 ?
                this.inflForm(['Adj','Masc/Fem'],
                                this.context ? indefArticle(['Masc/Fem'], this.locale) : null,
                                this.context ? '+'+ this.$t('tags.NOUN') : null,
                                `PerfPart${this.lemmaId} Masc${this.lemmaId}`) : null,
            this.hasPerfPart && this.part !== 4 ?
                this.inflForm(['Adj','Neuter'],
                                this.context ? indefArticle(['Neuter'], this.locale) : null,
                                this.context ? '+'+ this.$t('tags.NOUN') : null,
                                `PerfPart${this.lemmaId} Neuter${this.lemmaId}`) : null,
            this.hasPerfPart && this.part !== 4 ?
                this.inflForm(['Adj','Def'],
                                this.context ? 'den/det' : null,
                                this.context ? '+'+ this.$t('tags.NOUN') : null,
                                `PerfPart${this.lemmaId} Def${this.lemmaId}`) : null,
            this.hasPerfPart && this.part !== 3 ?
                this.inflForm(['Adj','Plur'],
                                null,
                                this.context ? '+'+ this.$t('tags.NOUN') : null,
                                `PerfPart${this.lemmaId} Plur${this.lemmaId}`) : null,
            this.part !== 3 ? this.inflForm(['Adj','<PresPart>'],
                                            null,
                                            null,
                                            `PresPart${this.lemmaId}`) : null
        ].filter(r => r) }
    },
    methods: {
        inflForm: function (tagList,prefix,suffix,headers) {
            const forms = inflectedForm(this.paradigm, tagList)
            if (forms) {
                return [prefix, forms, suffix, headers]
            } else {
                return null
            }
        }    }
}

</script>