<template>
  <div>
    <h3 id="felles" class="pb-1 text-xl">
      <AppLink to="#felles"> {{ $t("id.general") }}</AppLink>
    </h3>
    <TermSection :flex="true">
      <TermProp
        v-if="lalof(concept?.memberOf)"
        :flex="true"
        :label="$t('id.collection')"
      >
        <TermDescription
          prop="link"
          :flex="true"
          :data="[[lalof(concept.memberOf), '/' + termbase]]"
        />
      </TermProp>
      <TermProp v-if="concept?.domene" :flex="true" :label="$t('id.domain')">
        <TermDescription :flex="true" :data="[lalof(concept.domene)]" />
      </TermProp>
      <TermProp
        v-if="timeDisplay(concept?.startDate) || timeDisplay(concept?.endDate)"
        :flex="true"
        :label="$t('id.validityperiod')"
      >
        <TermDescription
          :flex="true"
          :data="[
            `${timeDisplay(concept?.startDate)}-${timeDisplay(
              concept.endDate
            )}`,
          ]"
        />
      </TermProp>
      <TermProp
        v-if="displayInfo?.subject"
        :flex="true"
        :label="$t('id.subject')"
      >
        <TermDescription :flex="true" :data="[displayInfo?.subject]" />
      </TermProp>
      <TermProp
        v-if="concept?.modified && !legacyTbs.includes(termbase)"
        :flex="true"
        :label="$t('id.modified')"
      >
        <TermDescription
          :flex="true"
          :data="[timeDisplay(concept.modified['@value'])]"
        />
      </TermProp>
      <template v-if="concept?.scopeNote">
        <TermProp
          v-for="scopeNote in Array.isArray(concept?.scopeNote)
            ? concept?.scopeNote
            : [concept?.scopeNote]"
          :key="scopeNote"
          :flex="true"
          :label="$t('id.note')"
        >
          <div class="block md:flex">
            <TermDescription
              :flex="true"
              :data="[scopeNote?.label?.['@value'] || scopeNote['@value']]"
              :data-lang="
                scopeNote?.label?.['@language'] || scopeNote['@language']
              "
            />
            <TermDescription
              v-if="scopeNote?.source"
              :flex="true"
              :data="[
                `
                            (${scopeNote.source})`,
              ]"
            />
          </div>
        </TermProp>
      </template>
      <TermProp
        v-if="legacyTbs.includes(termbase) && concept"
        :flex="true"
        :label="$t('id.note')"
      >
        <TermDescription
          :flex="true"
          :data="[$t('id.noteTermbaseIsUnmaintained')]"
        />
      </TermProp>
    </TermSection>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const locale = useLocale();
const termbase = route.params.termbase as Samling;

const props = defineProps({
  concept: { type: Object, required: true },
  displayInfo: { type: Object, required: true },
});

const timeDisplay = (data) => {
  try {
    const date = new Date(data).toLocaleDateString(locale.value);
    const dispDate = date !== "Invalid Date" ? date : "";
    const time = new Date(data).toLocaleTimeString(locale.value);
    const dispTime = time !== "Invalid Date" && time !== "00:00:00" ? time : "";
    if (dispTime) {
      return dispDate + ", " + dispTime;
    } else {
      return dispDate;
    }
  } catch (e) {
    return null;
  }
};
</script>
