

<script setup>
import { useStore } from '~/stores/searchStore'
const store = useStore()

const different = store.originalInput
</script>

<template>
    <div>
    <div aria-hidden="true" class="callout" v-if="different"><Icon name="bi:info-circle-fill" size="1.25em" class="mr-3 text-primary mb-0.5"/> Viser resultater for oppslagsordet <strong>{{$route.params.slug[0]}}.</strong></div>
    </div>
</template>