import { getLangDir } from 'rtl-detect';
import { TextBlocks } from '../TextBlocks';

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

interface DescriptionsProps {
  value: LinguisticObject[]
  language: string
}

export const Description = ({ value, language }: DescriptionsProps) => {
  if (!value) {
    return null
  }

  const briefDescriptions = value
    .filter((i: any) => i.hasType._id === 'd4b31289-91f4-484d-a905-b3fb0970413c') // filter on type "Brief description"
    .reduce((acc: { [key: string]: LinguisticObject }, item: LinguisticObject) => {
      const locale = item.language;
      acc[locale] = {
        ...item,
      };
      return acc;
    }, {})

  const text = briefDescriptions?.[language] || briefDescriptions?.en || briefDescriptions?.no

  if (!text) {
    return null
  }

  return (
    <div lang={text.language} dir={getLangDir(text.language)}>
      <TextBlocks value={text.body} />
    </div>
  )
}