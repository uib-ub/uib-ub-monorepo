export type InfoPageItem = {
    label: string
    href: string
  }
  
  export const infoPages: InfoPageItem[] = [
    { label: "Om stadnamnsøk", href: "/info/search" },
    { label: "Datasett", href: "/info/datasets" },
    { label: "Ordforklaringar", href: "/info/definitions" },
    { label: "Personvern", href: "/info/privacy" },
    { label: "Opphavsrett", href: "/info/license" },
  ]