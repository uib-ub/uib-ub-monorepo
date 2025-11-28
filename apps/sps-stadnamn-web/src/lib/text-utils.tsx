import parse from 'html-react-parser';
import sanitizeHtml from 'sanitize-html';

// Deprecated
export const createMarkup = (htmlString: string) => {
  const decodedHtmlString = htmlString.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
  return { __html: decodedHtmlString };
}


export const formatHtml = (htmlString: string) => {

  const sanitized = sanitizeHtml(htmlString,
    {
      allowedTags: ['b', 'i', 'em', "strong", "p", "br", "span", "a", "ul", "ol", "li", "h1", "h2", "h3", "h4", "h5", "h6"],
      allowedAttributes: {
        a: ['href'],
        span: ['class'],
      },
    }
  );

  return parse(sanitized);
}

export const formatHighlight = (highlight: string) => {
  // Clean up incomplete tags and auto-close unclosed tags
  let cleanHighlight = highlight?.replace(/<[^>]*$/, '')
    .replace(/^[^<]*>/, '')
    .replace(/<(?!\/?(?:mark|em|span)\b|span\s+class="font-phonetic")[^>]*>/g, '');

  // Auto-close unclosed tags
  const openTags: string[] = [];
  cleanHighlight = cleanHighlight?.replace(/<(\/?)(\w+)([^>]*)>/g, (match, slash, tag, attrs) => {
    if (slash) {
      openTags.pop();
    } else if (['mark', 'em', 'span'].includes(tag)) {
      openTags.push(tag);
    }
    return match;
  });

  // Close any remaining open tags
  while (openTags.length > 0) {
    cleanHighlight += `</${openTags.pop()}>`;
  }

  const sanitized = sanitizeHtml(cleanHighlight,
    {
      allowedTags: ['b', 'i', 'em', "strong", "mark", "p", "br", "span", "a", "ul", "ol", "li", "h1", "h2", "h3", "h4", "h5", "h6"],
      allowedAttributes: {
        a: ['href'],
      },
    }
  );
  return parse(sanitized);


};

export const detailsRenderer = (hit: any) => {
  const adm1 = hit.fields["group.adm1"]?.[0] || hit.fields?.group?.adm1?.[0] || hit.fields?.adm1?.[0] || hit.adm1?.[0]
  let adm2 = hit.fields["group.adm2"]?.[0] || hit.fields?.group?.adm2?.[0] || hit.fields?.adm2?.[0] || hit.adm2?.[0]
  if (adm2 == adm1) adm2 = undefined
  return <>{adm2 ? adm2 + ', ' : ''}{adm1}</>
}