<template>
    <tr>
      <td class="notranslate infl-cell"
          v-for="([prefix, [rowspan,rowindex,forms], suffix], index) in rows"
          :key="index"
          :rowspan="rowspan"
          :index="rowindex"
          v-bind:class="{hilite: $parent.highlighted(rowindex, lemmaId)}"
            @mouseover="$emit('hilite', rowindex, lemmaId)"
            @mouseleave="$emit('unhilite')">
        <span class='comma nobr'
              v-for="(form, index) in forms"
              :key="index">
          <em v-if="prefix" class="context">{{prefix}}</em>&nbsp;{{form}}<em v-if="suffix" class="context">{{suffix}}</em>
        </span>
      </td>
    </tr>
    </template>
    
    <script>
    
    
    
    import { inflectedForm, hasInflForm
           } from './mixins/ordbankUtils.js' 
    
    export default {
        name: 'inflectionRowVerb',
        props: ['paradigm','part','lemmaId'],
        data: function () {
            return {
                rows: [ !this.part || this.part==1 ? this.inflForm(['Inf'],['Pass'],'å') : null,
                        !this.part || this.part==1 ? this.inflForm(['Pres'],['Pass']) : null,
                        !this.part || this.part==1 ? this.inflForm(['Past']) : null,
                        !this.part || this.part==2 ? this.inflForm(['<PerfPart>'],['Adj'],'har') : null,
                        (!this.part || this.part==2) && hasInflForm(this.paradigm,['Imp']) ?
                        this.inflForm(['Imp'],null,null,'!') : null
                      ].filter(r => r)
            }
        },
        methods: {
            inflForm: function (tagList,exclTagList,prefix,suffix) {
                let forms = inflectedForm(this.paradigm, tagList, exclTagList)
                if (forms) {
                    return [prefix, forms, suffix]
                } else {
                    return null
                }
            }    }
    }
    </script>