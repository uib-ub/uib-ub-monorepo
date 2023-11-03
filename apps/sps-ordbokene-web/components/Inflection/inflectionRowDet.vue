<template>
    <tr>
      <td v-for="([[rowspan,rowindex,forms],headers], index) in cells"
          :key="index"
          class="notranslate infl-cell"
          :rowspan="rowspan"
          :headers="headers"
          :class="{hilite: $parent.highlighted(rowindex, lemmaId)}"
          @mouseover="$emit('hilite', rowindex, lemmaId)"
          @mouseleave="$emit('unhilite')">
        <span v-for="(form, i) in forms"
              :key="i"
              class='comma'
              >
        {{form}}</span>
      </td>
    </tr>
</template>
    
<script>
    
    
    
import { inflectedForm, tagToName
        } from './mixins/ordbankUtils.js' 

export default {
    name: 'inflectionRowPron',
    props: ['paradigm','locLang','lemmaId'],
    emits: ['hilite', 'unhilite'],
    data: function () {
        return {
            cells: [ this.inflForm(['Masc'],`Sing${this.lemmaId} Masc${this.lemmaId}`),
                        this.inflForm(['Fem'],`Sing${this.lemmaId} Frem${this.lemmaId}`),
                        this.inflForm(['Neuter'],`Sing${this.lemmaId} Neuter${this.lemmaId}`),
                        this.inflForm(['Def'],`Sing${this.lemmaId} Def${this.lemmaId}`),
                        this.inflForm([ 'Plur'],`Plur${this.lemmaId}`)
                    ].filter(r => r[0])
        }
    },
    computed: {
    },
    methods: {
        inflForm: function (tagList, headers) {
            return [inflectedForm(this.paradigm, tagList), headers]
        },
        tagToName: function (tag) {
            return tagToName(tag, this.language)
        }


    }
}
</script>