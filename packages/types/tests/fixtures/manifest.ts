import { Manifest } from '@iiif/presentation-3';

export const manifest: Manifest = {
  id: 'https://example.org/iiif/book1/manifest',
  label: {
    no: [
      'test'
    ]
  },
  type: 'Manifest',
  items: [
    {
      id: 'https://example.org/iiif/book1/canvas/p1',
      type: 'Canvas',
      label: {
        no: [
          'p. 1'
        ]
      },
      height: 1000,
      width: 750,
      items: [
        {
          id: 'https://example.org/iiif/book1/annotation/p0001-image',
          type: 'AnnotationPage',
          items: [
            {
              id: 'https://example.org/iiif/book1/annotation/p0001-image',
              type: 'Annotation',
              motivation: 'painting',
              body: {
                id: 'https://example.org/iiif/book1/res/page1.jpg',
                type: 'Image',
                format: 'image/jpeg',
                height: 2000,
                width: 1500,
                service: [
                  {
                    id: 'https://example.org/iiif/book1/res/page1',
                    type: 'ImageService3',
                    profile: 'level1',
                    height: 2000,
                    width: 1500,
                    tiles: [
                      {
                        width: 512,
                        scaleFactors: [1, 2, 4, 8, 16],
                      },
                    ],
                  }
                ],
              },
              target: 'https://example.org/iiif/book1/canvas/p1',
            },
          ],
        },
      ],
    },
  ],
};
