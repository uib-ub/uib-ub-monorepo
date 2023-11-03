<template>
    <tr>
      <td 
          v-for="([[rowspan,rowindex,forms], headers], index) in rows"
          :key="index"
          class="notranslate infl-cell"
          :rowspan="rowspan"
          :headers="headers"
          :class="{hilite: $parent.highlighted(rowindex, lemmaId)}"
           @mouseover="$emit('hilite', rowindex, lemmaId)"
           @mouseleave="$emit('unhilite')">
        <span v-for="form in forms"
              :key="form"
               class='comma'>
          {{form}}</span>
      </td>
      
    </tr>
</template>
    
<script>


import { inflectedForm
        } from './mixins/ordbankUtils.js' 

export default {
    name: 'inflectionRowAdjDeg',
    props: ['paradigm','lemmaId'],
    emits: ['hilite', 'unhilite'],
    data: function () {
        return {
            rows: [ this.inflForm(['Cmp'], `Deg${this.lemmaId} Cmp${this.lemmaId}`),
                    this.inflForm(['Sup','Ind'], `Deg${this.lemmaId} SupInd${this.lemmaId}`),
                    this.inflForm(['Sup','Def'], `Deg${this.lemmaId} SupDef${this.lemmaId}`)
                    ].filter(r => r && r[0])
                }
    },
    methods: {
        inflForm: function (tagList, headers) {
            return [inflectedForm(this.paradigm, tagList), headers]
        }
    

    }
}
</script>