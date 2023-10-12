<template>
    <tr class="infl-row">
      <template v-if="tags.tags">
        <th v-if="tags.label"
            :id="tags.label"
            class="infl-label xs"
            scope="row">
          {{tagToName(tags.label)}}
        </th>
        <td v-for="([rowspan,rowindex,forms], index) in cells"
            :key="index"
            class="notranslate infl-cell"
            :colspan="rowspan"
            :index="rowindex"
            :class="{hilite: $parent.highlighted(rowindex, lemmaId)}"
            @mouseover="$emit('hilite', rowindex, lemmaId)"
            @mouseleave="$emit('unhilite')">
          <span v-for="(form, index) in forms"
                class='comma'
                :key="index">
            {{form}}</span>
        </td>
      </template>
    </tr>
</template>
    
<script>



import { inflectedForm, tagToName
        } from './mixins/ordbankUtils.js' 

export default {
    name: 'inflectionRowsPron',
    props: ['paradigms','lemma','tags','language','lemma-id'],
    emits: ['hilite', 'unhilite'],
    data: function () {
        return {
            cells: this.paradigms.map(p => this.inflForm(p, this.tags.tags))
        }
    },
    computed: {
    },
    methods: {
        inflForm: function (paradigm, tagList) {
            const forms = inflectedForm(paradigm, tagList, [])
            return forms || [1,0,[this.lemma]] // workaround for missing inflection
        },
        tagToName: function (tag) {
            return tagToName(tag, this.language)
        }
    }
}
</script>