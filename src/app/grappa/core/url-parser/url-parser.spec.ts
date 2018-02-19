import { UrlParser } from './url-parser';

describe('UrlParser', () => {
  it('should combine path with base URL', () => {
    expect(UrlParser.parse('http://localhost', 'users/posts', []))
      .toBe('http://localhost/users/posts');

    expect(UrlParser.parse('http://localhost/', 'users/posts', []))
      .toBe('http://localhost/users/posts');

    expect(UrlParser.parse('http://localhost/', '/users/posts', []))
      .toBe('http://localhost/users/posts');

    expect(UrlParser.parse('http://localhost', '/users/posts', []))
      .toBe('http://localhost/users/posts');

    expect(UrlParser.parse('http://localhost:8080', 'users/posts', []))
      .toBe('http://localhost:8080/users/posts');

    expect(UrlParser.parse('http://localhost:8080/', 'users/posts', []))
      .toBe('http://localhost:8080/users/posts');

    expect(UrlParser.parse('http://localhost', '', []))
      .toBe('http://localhost/');
  });

  it('should ignore empty base URL', () => {
    expect(UrlParser.parse('', 'http://localhost/users/posts', []))
      .toBe('http://localhost/users/posts');

    expect(UrlParser.parse(null, 'http://localhost/users/posts', []))
      .toBe('http://localhost/users/posts');
  });

  it('should parse arguments', () => {
    expect(UrlParser.parse('http://localhost', 'users/{0}', [ 123 ]))
      .toBe('http://localhost/users/123');

    expect(UrlParser.parse('http://localhost', 'users/{0}/posts/{1}', [ 123, 987 ]))
      .toBe('http://localhost/users/123/posts/987');

    expect(UrlParser.parse('http://localhost', 'users/{0}/posts?byDate={1}', [ 123, '2018', { xyz: 'abc' } ]))
      .toBe('http://localhost/users/123/posts?byDate=2018');
  });
});
