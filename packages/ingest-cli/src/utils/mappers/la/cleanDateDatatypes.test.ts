import { cleanDateDatatypes } from './cleanDateDatatypes';

describe('cleanDateDatatypes', () => {
  it('should convert date values to ISO string format in a single object', () => {
    const data = {
      'http://purl.org/dc/terms/title': {
        no: ['Tittel'],
        en: ['Title'],
      },
      'http://purl.org/dc/terms/available': [
        { '@value': '2022-01-01T00:00:00Z' },
        { '@value': '2022-02-01T00:00:00Z' },
      ],
      'http://purl.org/dc/terms/modified': [
        { '@value': '2022-03-01T00:00:00Z' },
        { '@value': '2022-04-01T00:00:00Z' },
      ],
      'http://purl.org/dc/terms/issued': [
        { '@value': '2022-05-01T00:00:00Z' },
        { '@value': '2022-06-01T00:00:00Z' },
      ],
    };

    const expected = {
      'http://purl.org/dc/terms/title': {
        no: ['Tittel'],
        en: ['Title'],
      },
      'http://purl.org/dc/terms/available': [
        { '@value': '2022-01-01T00:00:00.000Z' },
        { '@value': '2022-02-01T00:00:00.000Z' },
      ],
      'http://purl.org/dc/terms/modified': [
        { '@value': '2022-03-01T00:00:00.000Z' },
        { '@value': '2022-04-01T00:00:00.000Z' },
      ],
      'http://purl.org/dc/terms/issued': [
        { '@value': '2022-05-01T00:00:00.000Z' },
        { '@value': '2022-06-01T00:00:00.000Z' },
      ],
    };

    expect(cleanDateDatatypes(data)).toEqual([expected]);
  });

  it('should convert date values to ISO string format in an array of objects', () => {
    const data = [
      {
        'http://purl.org/dc/terms/title': {
          no: ['Tittel 1'],
          en: ['Title 1'],
        },
        'http://purl.org/dc/terms/available': [
          { '@value': '2022-01-01T00:00:00Z' },
          { '@value': '2022-02-01T00:00:00Z' },
        ],
        'http://purl.org/dc/terms/modified': [
          { '@value': '2022-03-01T00:00:00Z' },
          { '@value': '2022-04-01T00:00:00Z' },
        ],
        'http://purl.org/dc/terms/issued': [
          { '@value': '2022-05-01T00:00:00Z' },
          { '@value': '2022-06-01T00:00:00Z' },
        ],
      },
      {
        'http://purl.org/dc/terms/title': {
          no: ['Tittel 2'],
          en: ['Title 2'],
        },
        'http://purl.org/dc/terms/available': [
          { '@value': '2022-07-01T00:00:00Z' },
          { '@value': '2022-08-01T00:00:00Z' },
        ],
        'http://purl.org/dc/terms/modified': [
          { '@value': '2022-09-01T00:00:00Z' },
          { '@value': '2022-10-01T00:00:00Z' },
        ],
        'http://purl.org/dc/terms/issued': [
          { '@value': '2022-11-01T00:00:00Z' },
          { '@value': '2022-12-01T00:00:00Z' },
        ],
      },
    ];

    const expected = [
      {
        'http://purl.org/dc/terms/title': {
          no: ['Tittel 1'],
          en: ['Title 1'],
        },
        'http://purl.org/dc/terms/available': [
          { '@value': '2022-01-01T00:00:00.000Z' },
          { '@value': '2022-02-01T00:00:00.000Z' },
        ],
        'http://purl.org/dc/terms/modified': [
          { '@value': '2022-03-01T00:00:00.000Z' },
          { '@value': '2022-04-01T00:00:00.000Z' },
        ],
        'http://purl.org/dc/terms/issued': [
          { '@value': '2022-05-01T00:00:00.000Z' },
          { '@value': '2022-06-01T00:00:00.000Z' },
        ],
      },
      {
        'http://purl.org/dc/terms/title': {
          no: ['Tittel 2'],
          en: ['Title 2'],
        },
        'http://purl.org/dc/terms/available': [
          { '@value': '2022-07-01T00:00:00.000Z' },
          { '@value': '2022-08-01T00:00:00.000Z' },
        ],
        'http://purl.org/dc/terms/modified': [
          { '@value': '2022-09-01T00:00:00.000Z' },
          { '@value': '2022-10-01T00:00:00.000Z' },
        ],
        'http://purl.org/dc/terms/issued': [
          { '@value': '2022-11-01T00:00:00.000Z' },
          { '@value': '2022-12-01T00:00:00.000Z' },
        ],
      },
    ];
    /* @ts-ignore */
    expect(cleanDateDatatypes(data)).toEqual(expected);
  });

  it('should return the input data unchanged, but as an array if no date properties are present', () => {
    const data = {
      'http://purl.org/dc/terms/title': 'Sample Title',
      'http://purl.org/dc/terms/creator': 'John Doe',
    };

    expect(cleanDateDatatypes(data)).toEqual([data]);
  });

  it('should return an empty array if the input data is an empty array', () => {
    const data: any[] = [];

    /* @ts-ignore */
    expect(cleanDateDatatypes(data)).toEqual([]);
  });
});