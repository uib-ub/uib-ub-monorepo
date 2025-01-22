<template>
  <div class="border p-3 rounded-md w-fit space-y-6">
    <div class="flex space-x-24">
      <dl class="flex space-x-24">
        <div class="space-y-2">
          <div v-if="termbase?.id" class="flex space-x-5">
            <dt class="font-semibold w-16">ID</dt>
            <dd>{{ termbase.id }}</dd>
          </div>
          <div v-if="termbase?.status" class="flex space-x-5">
            <dt class="font-semibold w-16">Status</dt>
            <dd>{{ termbase.status }}</dd>
          </div>
          <div v-if="termbase?.conceptCount" class="flex space-x-5">
            <dt class="font-semibold w-16">Begreper</dt>
            <dd>{{ termbase.conceptCount || 0 }}</dd>
          </div>
          <div v-if="termbase?.type" class="flex space-x-5">
            <dt class="font-semibold w-16">Type</dt>
            <dd>{{ termbase.type }}</dd>
          </div>
          <div v-if="termbase?.contact" class="flex space-x-5">
            <dt class="font-semibold w-16">Kontakt</dt>
            <dd>
              <div v-for="contact in termbase?.contact" :key="contact._id">
                <div v-if="!contact.email" class="">
                  {{ contact.label }}
                </div>
                <AppLink
                  v-else
                  class="underline hover:decoration-2"
                  :to="`mailto:${contact.email}`"
                  >{{ contact.label }}</AppLink
                >
              </div>
            </dd>
          </div>
        </div>
        <div class="space-y-2">
          <div v-if="termbase?.id" class="flex space-x-5">
            <dt class="font-semibold w-36">Ansatt</dt>
            <dd>{{ termbase.staff }}</dd>
          </div>
          <div v-if="termbase?.labels" class="flex space-x-5">
            <dt class="font-semibold w-36">Navn sjekket</dt>
            <dd>{{ termbase.labels ? "Ja" : "Nei" }}</dd>
          </div>
          <div v-if="termbase?.descriptions" class="flex space-x-5">
            <dt class="font-semibold w-36">Beskrivelse sjekket</dt>
            <dd>{{ termbase.descriptions ? "Ja" : "Nei" }}</dd>
          </div>
          <div v-if="termbase" class="flex space-x-5">
            <dt class="font-semibold w-36">Påminnelsesintervall</dt>
            <dd>{{ termbase?.reminderInterval || "Ingen" }}</dd>
          </div>
          <div v-if="termbase?.lastActivityDays" class="flex space-x-5">
            <dt class="font-semibold w-36">Siste aktivitet</dt>
            <dd>{{ termbase?.lastActivityDays || "Ingen" }}</dd>
          </div>
          <div v-if="termbase?.lastActivityDays" class="flex space-x-5">
            <dt class="font-semibold w-36">Påminnelse</dt>
            <dd
              v-if="termbase?.reminderCalc && termbase?.reminderCalc !== null"
            >
              {{ termbase?.reminderCalc }} d.
              <Icon
                name="material-symbols:circle"
                size="1.2em"
                class="mr-1 mb-[4px]"
                :class="getReminderColorClass(termbase)"
              ></Icon>
            </dd>
          </div>
        </div>
      </dl>
      <div class="space-y-2">
        <div class="font-semibold">Lenker</div>
        <ul class="space-y-2">
          <li v-if="termbase.status == '5. publisert'">
            <AppLink
              :to="`https://termportalen.no/tb/${termbase.id}`"
              class="underline hover:decoration-2"
              >Termportalen.no</AppLink
            >
          </li>
          <li>
            <AppLink
              :to="`https://wiki.terminologi.no/index.php?title=${termbase.id}`"
              class="underline hover:decoration-2"
              >Redigeringsapplikasjonen</AppLink
            >
          </li>
          <li>
            <AppLink
              :to="`${studioBaseRoute}/termbase;${termbase._id}`"
              target="_blank"
              class="underline hover:decoration-2"
            >
              Studio
            </AppLink>
          </li>
        </ul>
      </div>
    </div>
    <div v-if="termbase?.note" class="max-w-3xl">
      <div class="font-semibold mb-2">Merknad</div>
      <TpSanityContent :blocks="termbase.note" />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({ termbase: { type: Object, required: true } });
</script>
