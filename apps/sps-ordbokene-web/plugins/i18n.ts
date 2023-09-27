import { createI18n } from 'vue-i18n'
import eng from '../locales/eng.json'
import nno from '../locales/nno.json'
import nob from '../locales/nob.json'

export default defineNuxtPlugin(({ vueApp }) => {
  const route = useRoute()
  const locale_cookie = useCookie('currentLocale')
  let current_locale = locale_cookie.value
  if (!current_locale) {
    current_locale = route.params.locale || new Date().getDate() % 2 ? 'nno' : 'nob'
  }

  const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale: current_locale,
    messages: {
      eng,
      nno,
      nob
    }
  })

  vueApp.use(i18n)
})