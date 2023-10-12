<template>
    <tr>
      <td v-for="([rowspan,rowindex,forms], index) in rows"
          :key="index"
          class="notranslate infl-cell"
          :rowspan="rowspan"
          :index="rowindex"
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
    name: 'inflectionRowAdjAdv',
    props: ['paradigm','lemma-id'],
    emits: ['hilite', 'unhilite'],
    data: function () {
        return {
            rows: [ this.inflForm(['Pos']),
                    this.inflForm(['Cmp']),
                    this.inflForm(['Sup'])
                    ].filter(r => r)
                }
    },
    methods: {
        inflForm: function (tagList,exclTagList) {
            return inflectedForm(this.paradigm, tagList, exclTagList)
        }    }
    }
    </script>