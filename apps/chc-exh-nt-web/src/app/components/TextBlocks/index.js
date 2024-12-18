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
      BigTextBlock: ({ value }) => <BigTextBlock {...value} />,
      IframeBlock: ({ value }) => <IframeBlock {...value} />,
      GridBlock: ({ value }) => <GridBlock {...value} />,
      IllustrationWithCaption: ({ value }) => <IllustrationWithCaption {...value} />,
      ObjectBlock: ({ value }) => <ObjectBlock {...value} />,
      PageHeader: ({ value }) => <PageHeaderBlock {...value} />,
      Quote: ({ value }) => <QuoteBlock {...value} />,
      SectionText: ({ value }) => <TextBlock {...value} />,
      SingleObject: ({ value }) => <ObjectBlock {...value} />,
      PublicationBlock: ({ value }) => <PublicationBlock {...value} />,
      Table: ({ value }) => <TableBlock {...value} />,
      TwoColumn: ({ value }) => <TwoColumnBlock {...value} />,
      Video: ({ value }) => <VideoBlock {...value} />,
      Set: ({ value }) => <Gallery {...value} />,
      Actor: ({ value }) => <ActorBlock {...value} />,
    },

    block: {
      normal: ({ children }) => (
        <p className='col-start-auto col-end-auto md:col-start-3 md:col-end-4 block'>
          {children}
        </p>
      ),
      h1: ({ children }) => <h1 className='col-start-1 col-end-6 md:col-start-3 md:col-end-4'>{children}</h1>,
      h2: ({ children }) => <h2 className='col-start-1 col-end-6 md:col-start-3 md:col-end-4'>{children}</h2>,
      h3: ({ children }) => <h3 className='col-start-1 col-end-6 md:col-start-3 md:col-end-4'>{children}</h3>,
      h4: ({ children }) => <h4 className='col-start-1 col-end-6 md:col-start-3 md:col-end-4'>{children}</h4>,
      h5: ({ children }) => <h5 className='col-start-1 col-end-6 md:col-start-3 md:col-end-4'>{children}</h5>,
      h6: ({ children }) => <h6 className='col-start-1 col-end-6 md:col-start-3 md:col-end-4'>{children}</h6>,
    },

    marks: {
      link: ({ children, value }) => {
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
      bullet: ({ children }) => (
        <ul>
          {children}
        </ul>
      ),
      number: ({ children }) => (
        <ol>
          {children}
        </ol>
      ),
    },
  }
}

export const TextBlocks = ({ value }) => {
  return <PortableText value={value} components={myPortableTextComponents()} />
}
