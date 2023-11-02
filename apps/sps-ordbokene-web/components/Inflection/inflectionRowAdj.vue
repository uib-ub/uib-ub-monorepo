<template>
    <tr>
      <td v-for="([[rowspan,rowindex,forms], headers], index) in rows"
          :key="index"
          class="notranslate infl-cell"
          :headers="headers"
          :rowspan="rowspan"
          :class="{hilite: $parent.highlighted(rowindex, lemmaId)}"
           @mouseover="$emit('hilite', rowindex, lemmaId)"
           @mouseleave="$emit('unhilite')">
        <span v-for="form in forms"
              :key="form"
              class='comma'
              v-html="formattedForm(form)"/>
      </td>
    </tr>
</template>
    
<script>



import { inflectedForm, markdownToHTML
        } from './mixins/ordbankUtils.js'

export default {
    name: 'inflectionRowAdj',
    props: ['paradigm','hasFem','hasSing','lemmaId'],
    emits: ['hilite', 'unhilite'],
    data: function () {
        return {
            rows: [ this.hasSing ? this.inflForm(['Pos',['Masc/Fem','Masc']], 'Sing Masc') : null,
                    this.hasFem && this.hasSing ? this.inflForm(['Pos','Fem'], 'Sing Fem') : null,
                    this.hasSing ? this.inflForm(['Pos','Neuter'], 'Sing Neuter') : null,
                    this.hasSing ? this.inflForm(['Pos','Def','Sing'],'Sing Def') : null,
                    this.inflForm(['Pos','Plur'], 'Plur')
                    ].filter(r => r && r[0])
        }
    },
    methods: {
        inflForm: function (tagList,headers) {
            return [inflectedForm(this.paradigm, tagList, []), headers]
        },
        formattedForm: function (form) {
            return markdownToHTML(form)
        }    }
}
</script>
