import { createI18n } from 'vue-i18n'
import eng from '../locales/eng.json'
import nno from '../locales/nno.json'
import nob from '../locales/nob.json'

export default defineNuxtPlugin(({ vueApp }) => {
  const route = useRoute()
  const locale_cookie = useCookie('currentLocale')
  const headers = useRequestHeaders(['Accept-Language'])
  let locale = route.params.locale
  if (locale_cookie.value) {
    locale = locale_cookie.value
  }
  else if (process.client && navigator.language) {
    locale = detectLocale(navigator.language)
  }
  else if (!process.client) {
    locale = detectLocale(headers["accept-language"])
  }
  
  const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale,
    fallbackLocale: new Date().getDate() % 2 ? 'nno' : 'nob',
    messages: {
      eng,
      nno,
      nob
    }
  })

  vueApp.use(i18n)
})