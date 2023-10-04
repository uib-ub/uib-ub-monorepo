export const localeConfig = [
  {lang: 'en', locale: 'eng', name: 'English', icon: 'emojione-monotone:flag-for-united-kingdom'},
  {lang: 'nn', locale: 'nno', name: 'Nynorsk', icon: 'emojione-monotone:flag-for-norway'},
  {lang: 'nb', locale: 'nob', name: 'Bokmål', icon:'emojione-monotone:flag-for-norway'},
  {lang: 'uk', locale: 'ukr', name: 'Українська', icon: 'emojione-monotone:flag-for-ukraine'}
]

export const lang2locale = Object.fromEntries(localeConfig.map(item => [item.lang, item.locale]))


export const localizeUrl = (url, locale) => {
  if (url == "/") {
    return locale
  }
  else if (/^\/?(nob|nno|eng|ukr)(\/|$)/.test(url)) {
    return url.replace(/^(\/?)(nob|nno|eng|ukr)(\/|$)/, `$1${locale}$3`)
  }
  else {
    return url.replace(/^(\/?)/, `$1${locale}/`)
  }
}


export const detectLocale = langString => {
  if (langString) {
    let langs = langString.split(",")
    for (var i=0; i < langs.length; i++) {
      let lang = langs[i].slice(0,2)
      if (lang != 'en') {
        let locale = lang2locale[lang]
        if (locale) {
          return locale
        }
      }
    }
  }
}

export const specialSymbols = (q) => {
    return /[?_*%|]/.test(q)
  }

  export const advancedSpecialSymbols = (q) => {
    return /[?_*%]/.test(q) || q.split("|").length > 2
  }


  export const fraction = function(numerator, denominator) {
    var superscript = {
    '0': '⁰',
    '1': '¹',
    '2': '²',
    '3': '³',
    '4': '⁴',
    '5': '⁵',
    '6': '⁶',
    '7': '⁷',
    '8': '⁸',
    '9': '⁹',
    '+': '⁺',
    '-': '⁻',
    '=': '⁼',
    '(': '⁽',
    ')': '⁾',
    'a': 'ᵃ',
    'b': 'ᵇ',
    'c': 'ᶜ',
    'd': 'ᵈ',
    'e': 'ᵉ',
    'f': 'ᶠ',
    'g': 'ᵍ',
    'h': 'ʰ',
    'i': 'ⁱ',
    'j': 'ʲ',
    'k': 'ᵏ',
    'l': 'ˡ',
    'm': 'ᵐ',
    'n': 'ⁿ',
    'o': 'ᵒ',
    'p': 'ᵖ',
    'r': 'ʳ',
    's': 'ˢ',
    't': 'ᵗ',
    'u': 'ᵘ',
    'v': 'ᵛ',
    'w': 'ʷ',
    'x': 'ˣ',
    'y': 'ʸ',
    'z': 'ᶻ',
    ' ': ' '
    }
  
    var subscript = {
    '0': '₀',
    '1': '₁',
    '2': '₂',
    '3': '₃',
    '4': '₄',
    '5': '₅',
    '6': '₆',
    '7': '₇',
    '8': '₈',
    '9': '₉',
    '+': '₊',
    '-': '₋',
    '=': '₌',
    '(': '₍',
    ')': '₎',
    'a': 'ₐ',
    'e': 'ₑ',
    'h': 'ₕ',
    'i': 'ᵢ',
    'j': 'ⱼ',
    'k': 'ₖ',
    'l': 'ₗ',
    'm': 'ₘ',
    'n': 'ₙ',
    'o': 'ₒ',
    'p': 'ₚ',
    'r': 'ᵣ',
    's': 'ₛ',
    't': 'ₜ',
    'u': 'ᵤ',
    'v': 'ᵥ',
    'x': 'ₓ',
    ' ': ' '
    };
  
    var fractions = {
    '1/2': '½',
    '1/3': '⅓',
    '2/3': '⅔',
    '1/4': '¼',
    '3/4': '¾',
    '1/5': '⅕',
    '2/5': '⅖',
    '3/5': '⅗',
    '4/5': '⅘',
    '1/6': '⅙',
    '5/6': '⅚',
    '1/7': '⅐',
    '1/8': '⅛',
    '3/8': '⅜',
    '5/8': '⅝',
    '7/8': '⅞',
    '1/9': '⅑',
    '1/10': '⅒'
    };
  
    let other_fraction = null
  
    let num_sup = numerator.toString().split('').map(x => superscript[x] || '_').join('')
    let den_sub = denominator.toString().split('').map(x => subscript[x] || '_').join('')
  
    if (! num_sup.includes('_') && ! den_sub.includes('_')) {
      other_fraction = num_sup + '⁄' +  den_sub
    }
  
    return fractions[numerator + '/' + denominator] && {type: 'plain', html: fractions[numerator + '/' + denominator] }
        || other_fraction && {type: 'plain', html: other_fraction }
        || {type: 'fraction', html: '', num: numerator, denom: denominator}
  
    }
  
export const roman_hgno = (lemma) => {
  let hgint = parseInt(lemma.hgno)
  if (hgint > 0) {
    return ["I","II","III","IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI"][hgint-1]
  }
  return ""
}