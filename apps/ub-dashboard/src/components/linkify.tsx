export const Linkify = ({ replacePattern, children }: { replacePattern?: string[], children: string }) => {
  const isUrl = (word: string) => {
    const urlPattern = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/gm;
    return word.match(urlPattern)
  }

  const addMarkup = (word: string) => {
    const w = replacePattern?.length === 2 && word ? word.replace(replacePattern[0], replacePattern[1]) : word

    return isUrl(w) ?
      `<a style="text-decoration: underline; text-underline-offset: 2;" href="${w}" target="_blank">${w}</a>` :
      w
  }

  const words = children.split(' ')
  const formatedWords = words.map((w, i) => addMarkup(w))
  const html = formatedWords.join(' ')
  return (<span dangerouslySetInnerHTML={{ __html: html }} />)
}