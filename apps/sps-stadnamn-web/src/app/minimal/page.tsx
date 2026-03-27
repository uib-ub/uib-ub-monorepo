

import { formatHtml } from '@/lib/text-utils';
import parse from 'html-react-parser';
import sanitizeHtml from 'sanitize-html';

export default function MinimalPage() {

    const demoText = Array.from({ length: 200 }).map((_, index) => `
    <h1>Minimal Page</h1>
    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.</p>
    <ul>
        <li>Item 1</li>
        <li>Item 2</li>
        <li>Item 3</li>
    </ul>
    <ol>
        <li>Item 1</li>
        <li>Item 2</li>
        <li>Item 3</li>
    </ol>
    `).join("\n")

    const sanitizedText = sanitizeHtml(demoText, {
        allowedTags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'li', 'br'],
        allowedAttributes: {},
    })

    const formattedText = formatHtml(sanitizedText)


    return (
        <main className="bg-white p-1">
            <div>
                {formattedText}
            </div>

       
        </main>
    )
}