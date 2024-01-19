export type MainNavProps = {
  href?: string
  label: string
  items?: MainNavProps[]
  disabled?: boolean
}

export const mainNav: MainNavProps[] = [
  { href: "persons", label: "Personer" },
  { href: "groups", label: "Grupper" },
  { href: "projects", label: "Prosjekt" },
  { href: "timeline", label: "Tidslinje" },
  {
    label: 'Digital utvikling',
    items: [
      { href: "links", label: "Lenker" },
      { href: "software", label: "Programvare" },
      { href: "link-shortener", label: "Kortlenker" },
      { href: "qa/validation/marcus", label: "Validering" },
    ]
  },
]
