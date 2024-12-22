const defaults = { open: '«', close: '»', find: '"' }

export const convertQuotationMarks = (blocks: any, chars = defaults) => {
  const characters = chars === defaults ? defaults : { ...defaults, ...chars }
  const find = characters.find.replace(/([?!${}*:()|=^[\]/\\.+])/g, '\\$1')
  const pattern = new RegExp(find, 'g')

  return blocks.map((block: any) => {
    if (block._type !== 'block' || !block.children) {
      return block
    }

    let isOpen = false
    const children = block.children.map((child: any) => {
      if (child._type !== 'span' || !child.text) {
        return child
      }

      const text = child.text.replace(pattern, () => {
        const char = isOpen ? characters.close : characters.open
        isOpen = !isOpen
        return char
      })

      return { ...child, text }
    })

    return { ...block, children }
  })
}
