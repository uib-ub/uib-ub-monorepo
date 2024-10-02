<template>
  <div class="flex">
    <!-- <SideBar/> -->
    <main class="pt-8">
      <TermbaseOverview v-model:modelValue="selectedTermbase" />
      <TermbaseBlocker
        v-if="selectedTermbase.length > 0"
        :key="'blocker' + selectedTermbase.map((tb) => tb._id).join('')"
        :termbases="selectedTermbase"
      />
      <TermgroupMembers
        v-if="selectedTermbase.length > 0"
        :key="'members' + selectedTermbase.map((tb) => tb._id).join('')"
        :termbases="selectedTermbase.map((tb) => tb._id)"
      />
      <TermbaseActivities
        v-if="selectedTermbase.length > 0"
        :key="'activities' + selectedTermbase.map((tb) => tb._id).join('')"
        :termbases="
          Object.fromEntries(selectedTermbase.map((d) => [d._id, d.label]))
        "
      />
    </main>
  </div>
</template>

<script setup lang="ts">
const selectedTermbase = ref([]);
</script>
