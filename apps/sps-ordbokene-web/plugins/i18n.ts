import { createI18n } from 'vue-i18n'
import eng from '../locales/eng.json'
import nno from '../locales/nno.json'
import nob from '../locales/nob.json'
import ukr from '../locales/ukr.json'

export default defineNuxtPlugin(({ vueApp }) => {
  const route = useRoute()
  const locale_cookie = useCookie('currentLocale')
  const headers = useRequestHeaders(['Accept-Language'])
  let locale = route.params.locale || new Date().getDate() % 2 ? 'nno' : 'nob'
  if (locale_cookie.value) {
    console.log("INIT COOKIE LOCALE")
    locale = locale_cookie.value
  }
  else if (process.client && navigator.language) {
    console.log("INIT NAVIGATOR LOCALE")
    locale = detectLocale(navigator.language) || locale
  }
  else if (!process.client) {
    console.log("INIT HEADER LANGUAGE")
    locale = detectLocale(headers["accept-language"]) || locale
  }
  
  const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale,
    fallbackLocale: new Date().getDate() % 2 ? 'nno' : 'nob',
    messages: {
      eng,
      nno,
      nob,
      ukr
    }
  })

  vueApp.use(i18n)
})