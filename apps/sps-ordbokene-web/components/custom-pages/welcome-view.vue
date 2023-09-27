<template>
<keep-alive>
<Welcome v-if="!$route.query.q"/>
</keep-alive>
</template>