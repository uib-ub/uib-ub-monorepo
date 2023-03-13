import DOMPurify from 'dompurify';
import blockTools from '@sanity/block-tools';

export const validationsPass = (html) => {
  //console.log(html)
  // must have same number of opening and closing brackets
  const numberOpeningMatchesClosing =
    (html.match(/</g) || []).length === (html.match(/>/g) || []).length;
  return numberOpeningMatchesClosing;
};

export const isValidHTML = (html) => {
  if (validationsPass(html)) {
    const doc = document.createElement('div');
    const htmlWithDoubleQuotes = html.replace(/'/g, '"');
    // replaces & with &amp; in urls inside img-tag
    // Fix for https://github.com/HansKre/sanity-plugin-html-to-portable-text/issues/6
    const withoutAmpersand = htmlWithDoubleQuotes.replace(
      /(?<=\<img src.*)(&)(?=.*\"\>)/g,
      '&amp;'
    );
    // doc.innerHTML = withoutAmpersand;
    console.log(
      doc.innerHTML,
      withoutAmpersand,
      doc.innerHTML === withoutAmpersand
    );
    // BUG: Returns false when there are escaped æøå. Why? Element not having meta tag set to utf8?
    return doc.innerHTML === withoutAmpersand;
  }
  return false;
};

export function convertToBlock(
  blockContentType,
  inputValue,
  withoutValidation
) {
  if (isValidHTML(inputValue) || withoutValidation) {
    // sanitize html
    const cleanHtmlString = sanitizeHtml(inputValue);
    // const cleanHtmlWithoutTrailingNewline = cleanHtmlString.replace(/^\<br>+|\<br>+$/g, '')
    // console.log('Cleaned: ', cleanHtmlWithoutTrailingNewline)
    // replace U+00A0
    const NON_BREAKING_SPACE = /U\+00A0/g;
    const withoutSpecialChars = cleanHtmlString.replace(
      new RegExp(NON_BREAKING_SPACE),
      ' '
    );
    // replace single backslash from html since input component escapes them already
    const cleanHtmlStringWithoutBackslash = withoutSpecialChars?.replace(
      /(?<!\\)\\(?!\\)/,
      ''
    );
    // convert
    const blocks = blockTools.htmlToBlocks(
      cleanHtmlStringWithoutBackslash,
      blockContentType
    );
    // console.log('Blocks: ', blocks)
    return blocks;
  } else {
    return null;
  }
}

function sanitizeHtml(html) {
  const pure = DOMPurify.sanitize(html, { ALLOWED_TAGS: ['br', 'b', 'i', 'p', 'h1', 'h2', 'h3', 'blockquote', 'ol', 'ul', 'li', 'a'], ALLOWED_ATTR: ['href'] });
  // console.log(pure)
  return pure
}