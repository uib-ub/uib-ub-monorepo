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

export const Description = ({ value, language }: DescriptionProps) => {
  const briefDescriptions = value
    .filter((i: any) => i.hasType._id === 'd4b31289-91f4-484d-a905-b3fb0970413c') // filter on type "Brief description"
    .filter((desc: any) => desc.language === language)[0]

  return (
    <TextBlocks value={briefDescriptions?.body} />
  )
}