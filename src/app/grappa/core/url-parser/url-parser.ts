export class UrlParser {
  private static readonly SlashSuffix = /[\\/]*$/;
  private static readonly SlashPrefix = /^[\\/]*/;
  private static readonly Placeholder = /{([0-9]+)}/g;

  static parse(baseUrl: string, endpoint: string, args: any[]) {
    return UrlParser
      .merge(baseUrl, endpoint)
      .replace(UrlParser.Placeholder, (match, index) => UrlParser.replace(index, args));
  }

  private static replace(index, args: any[]): string {
    const idx = parseInt(index, 10);

    if (idx < 0 || idx >= args.length) {
      throw new ReferenceError(`REST method was not provided with argument at index ${idx}.`);
    }

    return encodeURIComponent(args[ idx ]);
  }

  private static merge(baseUrl: string, endpoint: string): string {
    if (typeof baseUrl === 'string' && baseUrl.length > 0) {
      return `${baseUrl.replace(UrlParser.SlashSuffix, '')}/${endpoint.replace(UrlParser.SlashPrefix, '')}`;
    }

    return endpoint;
  }
}
