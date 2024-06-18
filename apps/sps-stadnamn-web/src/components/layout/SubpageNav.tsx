
import Link from 'next/link';
import { PiCaretRightBold

 } from 'react-icons/pi';
export default function SubpageNav({ children, items }: { children?: React.ReactNode, items: { label: string, href: string }[] }) {
    return (
        <nav>
            {children}
            <ul className="mt-1 !list-none !pl-0 mb-4 space-y-3">
                {items.map((item, index) => (
                    <li className="text-balance text-lg" key={index}>
                        <Link className="no-underline" href={item.href}>
                            {item.label}
                            <PiCaretRightBold aria-hidden="true" className='text-primary-600 inline align-middle ml-1'/>
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}