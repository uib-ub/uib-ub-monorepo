import { PortableText } from '@portabletext/react'
import {
  ActorBlock,
  BigTextBlock,
  IframeBlock,
  PageHeaderBlock,
  QuoteBlock,
  TextBlock,
  ObjectBlock,
  TableBlock,
  GridBlock,
  TwoColumnBlock,
  VideoBlock,
  IllustrationWithCaption,
  Gallery,
  PublicationBlock,
} from './Blocks'
import { Link } from '@/src/i18n/routing'

const myPortableTextComponents = () => {
  return {
    types: {
      BigTextBlock: ({ value }: any) => <BigTextBlock {...value} />,
      IframeBlock: ({ value }: any) => <IframeBlock {...value} />,
      GridBlock: ({ value }: any) => <GridBlock {...value} />,
      IllustrationWithCaption: ({ value }: any) => <IllustrationWithCaption {...value} />,
      ObjectBlock: ({ value }: any) => <ObjectBlock {...value} />,
      PageHeader: ({ value }: any) => <PageHeaderBlock {...value} />,
      Quote: ({ value }: any) => <QuoteBlock {...value} />,
      SectionText: ({ value }: any) => <TextBlock {...value} />,
      SingleObject: ({ value }: any) => <ObjectBlock {...value} />,
      PublicationBlock: ({ value }: any) => <PublicationBlock {...value} />,
      Table: ({ value }: any) => <TableBlock {...value} />,
      TwoColumn: ({ value }: any) => <TwoColumnBlock {...value} />,
      Video: ({ value }: any) => <VideoBlock {...value} />,
      Set: ({ value }: any) => <Gallery {...value} />,
      Actor: ({ value }: any) => <ActorBlock {...value} />,
    },

    block: {
      normal: ({ children }: any) => (
        <p className='col-start-auto col-end-auto md:col-start-3 md:col-end-4 block'>
          {children}
        </p>
      ),
      h1: ({ children }: any) => <h1 className='col-start-1 col-end-6 md:col-start-3 md:col-end-4'>{children}</h1>,
      h2: ({ children }: any) => <h2 className='col-start-1 col-end-6 md:col-start-3 md:col-end-4'>{children}</h2>,
      h3: ({ children }: any) => <h3 className='col-start-1 col-end-6 md:col-start-3 md:col-end-4'>{children}</h3>,
      h4: ({ children }: any) => <h4 className='col-start-1 col-end-6 md:col-start-3 md:col-end-4'>{children}</h4>,
      h5: ({ children }: any) => <h5 className='col-start-1 col-end-6 md:col-start-3 md:col-end-4'>{children}</h5>,
      h6: ({ children }: any) => <h6 className='col-start-1 col-end-6 md:col-start-3 md:col-end-4'>{children}</h6>,
    },

    marks: {
      link: ({ children, value }: any) => {
        const rel = !value.href.startsWith('/') ? 'noreferrer noopener' : undefined
        return (
          <Link href={value.href} rel={rel}>
            {children}
          </Link>
        )
      },
    },

    list: {
      // Ex. 1: customizing common list types
      bullet: ({ children }: any) => (
        <ul>
          {children}
        </ul>
      ),
      number: ({ children }: any) => (
        <ol>
          {children}
        </ol>
      ),
    },
  }
}

export const TextBlocks = ({ value }: any) => {
  return <PortableText value={value} components={myPortableTextComponents()} />
}
