<template>
  <div>
    <h3 id="felles" class="pb-1 text-xl">
      <AppLink to="#felles"> {{ $t("id.general") }}</AppLink>
    </h3>
    <TermpostTermSection :flex="true">
      <client-only>
        <TermpostTermProp
          v-if="concept?.memberOf"
          :flex="true"
          :label="$t('id.collection')"
        >
          <TermpostTermDescription
            prop="link"
            :flex="true"
            :data="[{ target: [lalof(concept.memberOf), '/tb/' + termbase] }]"
          />
        </TermpostTermProp>
        <TermpostTermProp
          v-if="concept?.domene"
          :flex="true"
          :label="$t('id.domain')"
        >
          <TermpostTermDescription
            :flex="true"
            :data="[lalof(concept.domene)]"
          />
        </TermpostTermProp>
        <TermpostTermProp
          v-if="
            timeDisplay(concept?.startDate) || timeDisplay(concept?.endDate)
          "
          :flex="true"
          :label="$t('id.validityperiod')"
        >
          <TermpostTermDescription
            :flex="true"
            :data="[
              `${timeDisplay(concept?.startDate)}-${timeDisplay(
                concept.endDate
              )}`,
            ]"
          />
        </TermpostTermProp>
      </client-only>
      <TermpostTermProp
        v-if="displayInfo?.subject"
        :flex="true"
        :label="$t('id.subject')"
      >
        <TermpostTermDescription :flex="true" :data="[displayInfo?.subject]" />
      </TermpostTermProp>
      <TermpostTermProp
        v-if="
          concept?.modified &&
          !termbaseConfig.base.legacyTermbases.includes(termbase)
        "
        :flex="true"
        :label="$t('id.modified')"
      >
        <TermpostTermDescription
          :flex="true"
          :data="[timeDisplay(concept.modified['@value'])]"
        />
      </TermpostTermProp>
      <template v-if="concept?.scopeNote">
        <TermpostTermProp
          v-for="scopeNote in Array.isArray(concept?.scopeNote)
            ? concept?.scopeNote
            : [concept?.scopeNote]"
          :key="scopeNote"
          :flex="true"
          :label="$t('id.note')"
        >
          <div class="block md:flex">
            <TermpostTermDescription
              :flex="true"
              :data="[scopeNote?.label?.['@value'] || scopeNote['@value']]"
              :data-lang="
                scopeNote?.label?.['@language'] || scopeNote['@language']
              "
            />
            <TermpostTermDescription
              v-if="scopeNote?.source"
              :flex="true"
              :data="[`(${scopeNote.source})`]"
            />
          </div>
        </TermpostTermProp>
      </template>
      <TermpostTermProp
        v-if="termbaseConfig.base.legacyTermbases.includes(termbase) && concept"
        :flex="true"
        :label="$t('id.note')"
      >
        <TermpostTermDescription
          :flex="true"
          :data="[$t('id.noteTermbaseIsUnmaintained')]"
        />
      </TermpostTermProp>
      <TermpostGeneralSectionSnomedExtras
        :concept="concept"
        :display-info="displayInfo"
      />
      <TermpostGeneralSectionSnExtras
        :concept="concept"
        :display-info="displayInfo"
      />
    </TermpostTermSection>
  </div>
</template>

<script setup lang="ts">
import { termbaseConfig } from "~/utils/vars-termbase";

const route = useRoute();
const locale = useLocale();
const termbase = route.params.termbase as string;

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
