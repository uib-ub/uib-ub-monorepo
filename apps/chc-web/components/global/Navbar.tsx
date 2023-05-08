import { resolveHref } from 'lib/sanity/sanity.links'
import Link from 'next/link'
import { MenuItem } from 'types'

interface NavbarProps {
  menuItems?: MenuItem[]
}

export function Navbar({ menuItems }: NavbarProps) {
  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-x-5 bg-white/80 py-4 px-4 backdrop-blur md:py-5 md:px-16 lg:px-32">
      {menuItems &&
        menuItems.map((menuItem, key) => {
          const href = resolveHref(menuItem?._type, menuItem?.slug)
          if (!href) {
            return null
          }
          return (
            <Link
              key={key}
              className={`text-lg hover:text-black md:text-xl ${menuItem?._type === 'home'
                ? 'font-extrabold text-black'
                : 'text-gray-600'
                }`}
              href={href}
            >
              {menuItem.title}
            </Link>
          )
        })}
      <Link
        href="/items/ubb-jg-l-0985"
        className={`text-lg hover:text-black md:text-xl text-gray-600`}
      >
        ubb-jg-l-0985
      </Link>
      <Link
        href="/items/ubb-ms-0008"
        className={`text-lg hover:text-black md:text-xl text-gray-600`}
      >
        ubb-ms-0008
      </Link>
      <Link
        href="/samla-collections"
        className={`text-lg hover:text-black md:text-xl text-gray-600`}
      >
        SAMLA Collections
      </Link>
      <a
        href="https://search-prototype-one.vercel.app/search"
        className={`text-lg hover:text-black md:text-xl text-gray-600`}
      >
        Search
      </a>
    </div>
  )
}
