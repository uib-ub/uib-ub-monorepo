import { TextBlocks } from '../TextBlocks'

interface Body {
  _key: string;
  _type: string;
  children: any[];
  markDefs: any[];
  style: string;
}

interface Label {
  _type: string;
  en: string;
  no: string;
}

interface HasType {
  _id: string;
  label: Label;
}

interface LinguisticObject {
  _key: string;
  _type: string;
  accessState: string;
  body: Body[];
  creator?: any;
  editorialState: string;
  hasType: HasType;
  language: string;
}

interface DescriptionProps {
  value: LinguisticObject[]
  language: string
}

export const Description = ({ value, language }: DescriptionProps): React.ReactNode => {
  // Sanitize function that removes all invisible characters and normalizes the string
  const sanitizeString = (str: string) => {
    if (!str) return '';
    return str
      // Remove all invisible characters and control characters
      .replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200D\uFEFF\u2028\u2029]/g, '')
      // Normalize unicode characters
      .normalize('NFKD')
      // Remove any remaining non-printable or hidden characters
      .replace(/[^\x20-\x7E]/g, '')
      // Remove whitespace
      .trim();
  };
  const sanitizedLang = sanitizeString(language);

  const briefDescriptions = value
    .filter((i: any) => i.hasType._id === 'd4b31289-91f4-484d-a905-b3fb0970413c')
    .filter((desc: any) => {
      const sanitizedDescLang = sanitizeString(desc.language);
      if (sanitizedDescLang === sanitizedLang) {
        return desc;
      }
      if (sanitizedDescLang === 'no') {
        return desc;
      }
      if (sanitizedDescLang === 'en') {
        return desc;
      }
    })

  const text = briefDescriptions[0] || null;

  return (
    <TextBlocks value={text?.body} />
  );
}