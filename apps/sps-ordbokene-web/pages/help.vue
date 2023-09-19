<template>
<main id="main" tabindex="-1" class="secondary-page">
    <ContentQuery :path="`/${$i18n.locale}/help`" find="one" v-slot="{ data }">
            <ContentRenderer :value="data"/>
    </ContentQuery>
</main>
</template>