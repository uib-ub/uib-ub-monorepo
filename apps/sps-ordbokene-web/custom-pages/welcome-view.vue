<template>
<div>
<Suggest v-if="$route.query.q"/>
<Welcome v-else/>
</div>
</template>