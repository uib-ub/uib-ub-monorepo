<script>
    export default {
        name: 'inflectedForm',
        props: ['prefix','form','first']
    }
</script>

<template>
<span>
  <span v-if="!first">, </span>{{prefix}}{{form}}</span>
</template>