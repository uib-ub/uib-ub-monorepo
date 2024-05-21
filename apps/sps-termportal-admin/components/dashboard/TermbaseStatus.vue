<template>
  <section class="">
    <h2 class="text-lg font-semibold pb-5 text-gray-800">Termbase status</h2>
    <div class="py-0.5 px-0.5 flex text-lg max-w-fit bg-tpblue-400">
      <div v-if="data?.ingen" class="arrow right flex">
        <span
          ><span class="font-semibold pr-2">{{ data?.ingen }}</span
          >ingen</span
        >
      </div>
      <div class="arrow right flex" :class="{ left: data?.ingen }">
        <span
          ><span class="font-semibold pr-2">{{ data?.kjent }}</span
          >kjent</span
        >
      </div>
      <div class="arrow left right flex">
        <span
          ><span class="font-semibold pr-2">{{ data?.planlagt }}</span
          >planlagt</span
        >
      </div>
      <div class="arrow left right flex">
        <span
          ><span class="font-semibold pr-2">{{ data?.initialisert }}</span
          >initialisert</span
        >
      </div>
      <div class="arrow left right flex">
        <span
          ><span class="font-semibold pr-2">{{ data?.opprettet }}</span
          >opprettet</span
        >
      </div>
      <div class="arrow left flex">
        <span style="padding-right: 30px"
          ><span class="font-semibold pr-2">{{ data?.publisert }}</span
          >publisert</span
        >
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const query = `
{
  "ingen": count(*[_type == "termbase" && status == null]),
  "kjent": count(*[_type == "termbase" && status == "kjent"]),
  "planlagt": count(*[_type == "termbase" && status == "planlagt"]),
  "initialisert": count(*[_type == "termbase" && status == "initialisert"]),
  "opprettet": count(*[_type == "termbase" && status == "opprettet"]),
  "publisert": count(*[_type == "termbase" && status == "publisert"])
}
`;

const { data } = useLazySanityQuery(query);
</script>

<style>
.arrow > span {
  display: block;
  position: relative;
  height: 40px;
  line-height: 40px;
  transition: all 0.3s ease-in;
  padding-left: 30px;
  padding-right: 20px;
  @apply bg-white;
}

.right::after {
  content: "";
  height: 0;
  width: 0;
  top: 0;
  right: 0;
  border-bottom: 20px solid transparent;
  border-top: 20px solid transparent;
  border-left: 10px solid white;
  border-right: 0px solid transparent;
  transition: all 0.3s ease-in;
  z-index: 2;
}

.left::before {
  content: "";
  height: 0;
  width: 0;
  top: 0;
  right: 0;
  transform: translateX(100%);
  border-bottom: 20px solid transparent;
  border-top: 20px solid transparent;
  border-left: 10px solid #14417b;
  border-right: 0px solid transparent;
  transition: all 0.3s ease-in;
  z-index: 1;
  margin-left: -17px;
}
</style>
