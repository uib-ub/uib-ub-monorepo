import { normalizeJsonLdToArray } from '@shared/utils/normalizeJsonLdToArray';

describe('normalizeJsonLdToArray', () => {
  it('should remove @context and return array for single object', () => {
    const input = {
      '@context': 'http://example.org/context',
      'title': 'Test Title',
      'description': 'Test Description'
    };

    const expected = [{
      'title': 'Test Title',
      'description': 'Test Description'
    }];

    expect(normalizeJsonLdToArray(input)).toEqual(expected);
  });

  it('should remove @context and return @graph array if present', () => {
    const input = {
      '@context': 'http://example.org/context',
      '@graph': [
        {
          'title': 'Title 1',
          'description': 'Description 1'
        },
        {
          'title': 'Title 2',
          'description': 'Description 2'
        }
      ]
    };

    const expected = [
      {
        'title': 'Title 1',
        'description': 'Description 1'
      },
      {
        'title': 'Title 2',
        'description': 'Description 2'
      }
    ];

    expect(normalizeJsonLdToArray(input)).toEqual(expected);
  });
});
