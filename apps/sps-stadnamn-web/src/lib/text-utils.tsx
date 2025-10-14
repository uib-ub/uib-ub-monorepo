import parse from 'html-react-parser';
import DOMPurify from 'isomorphic-dompurify';

// Deprecated
export const createMarkup = (htmlString: string) => {
    const decodedHtmlString = htmlString.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
    return {__html: decodedHtmlString};
  }


  export const formatHtml = (htmlString: string) => {
    const decoded = htmlString //.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
    const sanitized = DOMPurify.sanitize(decoded);
    return parse(sanitized);
    
}
  
export const formatHighlight = (highlight: string) => {
    // Clean up incomplete tags and auto-close unclosed tags
    let cleanHighlight = highlight.replace(/<[^>]*$/, '')
      .replace(/^[^<]*>/, '')
      .replace(/<(?!\/?(?:mark|em|span)\b|span\s+class="font-phonetic")[^>]*>/g, '');
      
    // Auto-close unclosed tags
    const openTags: string[] = [];
    cleanHighlight = cleanHighlight.replace(/<(\/?)(\w+)([^>]*)>/g, (match, slash, tag, attrs) => {
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

    const sanitized = DOMPurify.sanitize(cleanHighlight);
    return parse(sanitized);
      

  };