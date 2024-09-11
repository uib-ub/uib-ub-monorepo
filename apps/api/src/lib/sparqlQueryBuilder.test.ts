import { sqb } from '@lib/sparqlQueryBuilder';

describe('sparqlQueryBuilder', () => {
  it('should interpolate the query string with the given parameters', () => {
    const query = `SELECT * WHERE { 
      VALUES ?id {"%id"}
      ?subject dct:identifier ?id ;
        ?predicate %object 
    }`;
    const params = {
      id: 'ubb-abc-123',
      object: '<http://example.org/object>',
    };
    const expected = `SELECT * WHERE { 
      VALUES ?id {"ubb-abc-123"}
      ?subject dct:identifier ?id ;
        ?predicate <http://example.org/object> 
    }`;

    const result = sqb(query, params);

    expect(result).toEqual(expected);
  });

  it('should throw an error if a parameter is missing', () => {
    const query = 'SELECT * WHERE { ?subject %predicate %object }';
    const params = {
      predicate: 'http://example.org/predicate',
    };

    expect(() => sqb(query, params)).toThrow('Missing parameter');
  });
});