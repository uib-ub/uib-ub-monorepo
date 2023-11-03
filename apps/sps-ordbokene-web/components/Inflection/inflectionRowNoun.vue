<template>
    <tr>
      <template v-for="([prefix, [rowspan,rowindex,forms], gender, colref], index) in cells" :key="index"> 
        <th v-if="gender"
            :id="colref"
            class="infl-label"
            scope="row"
            :headers="'Gender'+lemma.id"
            :rowspan="rowspan"
            :class="{hilite: $parent.highlighted(rowindex, lemma.id)}"
            @mouseover="$emit('hilite', rowindex, lemma.id)">
          <span v-for="(form, i) in forms"
                :key="i"
                class='comma'>{{tagToName(form)}}</span>
        </th>
        <td v-else
            class="notranslate infl-cell"
            :headers="colref"
            :rowspan="rowspan"
            :class="{hilite: $parent.highlighted(rowindex, lemma.id)}"
            @mouseover="$emit('hilite', rowindex, lemma.id)"
            @mouseleave="$emit('unhilite')">
          <span v-for="(form, i) in forms"
                :key="i"
                class='comma'><em v-if="prefix" class="context">{{prefix}}</em>&nbsp;<span v-html="formattedForm(form)"/></span>
        </td>
      </template>
    </tr>
</template>
    
<script>



import { inflectedForm, tagToName, indefArticle, markdownToHTML
        } from './mixins/ordbankUtils.js' 

export default {
    name: 'inflectionRowNoun',
    props: ['paradigm','language', 'showGender', 'lemma','hasDef', 'hasSing', 'hasPlur'],
    emits: ['hilite', 'unhilite'],
    data: function () {
        return {
            cells: [
                this.showGender ? this.inflForm(['_gender']) : null, // special gender column
                this.inflForm(['Sing','Ind'], this.hasSing, this.indefArticle()),
                this.inflForm(['Sing','Def'], this.hasSing && this.hasDef),
                this.inflForm(['Plur','Ind'], this.hasPlur),
                this.inflForm(['Plur','Def'], this.hasPlur && this.hasDef)

            ].filter(r => r)
        }
    },
    methods: {
        indefArticle: function () {
            return indefArticle(this.paradigm.tags, this.language)
        },
        inflForm: function (tagList,display,prefix) {
            const forms = inflectedForm(this.paradigm, tagList, [])
            if (!forms) {
                return null
            } else if (forms[0] == null) {
                return display ? [null, [1,null,['–'],null,'STANDARD'], false, ''] : null
            } else if (tagList[0] === '_gender') {
                return [prefix, forms, true, forms[2]]
            } else {
                const gender = (this.showGender && forms[3]) ? forms[3].join(' ') + ' ' : ''
                return [prefix, forms, false, gender + tagList[0] +  ' ' + tagList[0] + tagList[1]]
            } 
        },
        formattedForm: function (form) {
            return markdownToHTML(form)
        },
        tagToName: function (tag) {
            return tagToName(tag, this.language)
        }


    }
}
</script>