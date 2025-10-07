export const createMarkup = (htmlString: string) => {
    const decodedHtmlString = htmlString.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
    return {__html: decodedHtmlString};
  }
  
export const formatHighlight = (highlight: string) => {
    // Clean up incomplete tags and auto-close unclosed tags
    let cleanHighlight = createMarkup(highlight).__html
      .replace(/<[^>]*$/, '')
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
      
    // Modified regex to properly capture font-phonetic spans
    const parts = cleanHighlight.split(/(<mark>|<\/mark>|<em>|<\/em>|<span class="font-phonetic">|<span class='font-phonetic'>|<\/span>)/);
    
    let markOpen = false;
    let emOpen = false;
    let fontPhoneticOpen = false;
    
    return (
      <span>
        {parts.map((part, i) => {
          if (part === '<mark>') { markOpen = true; return null; }
          if (part === '</mark>') { markOpen = false; return null; }
          if (part === '<em>') { emOpen = true; return null; }
          if (part === '</em>') { emOpen = false; return null; }
          if (part === "<span class='font-phonetic'>") { 
            fontPhoneticOpen = true; 
            return null; 
          }
          if (part === '</span>' && fontPhoneticOpen) { 
            fontPhoneticOpen = false; 
            return null; 
          }
          
          if (!part) return null;
          
          if (markOpen && emOpen && fontPhoneticOpen) return <mark key={i}><em><span className="font-phonetic">{part}</span></em></mark>;
          if (markOpen && emOpen) return <mark key={i}><em>{part}</em></mark>;
          if (markOpen && fontPhoneticOpen) return <mark key={i}><span className="font-phonetic">{part}</span></mark>;
          if (emOpen && fontPhoneticOpen) return <em key={i}><span className="font-phonetic">{part}</span></em>;
          if (markOpen) return <mark key={i}>{part}</mark>;
          if (emOpen) return <em key={i}>{part}</em>;
          if (fontPhoneticOpen) return <span key={i} className="font-phonetic">{part}</span>;
          return part;
        })}
      </span>
    );
  };