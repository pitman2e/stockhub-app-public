import { describe, it, expect } from 'vitest';
import utils from "../utils/utils";

describe('utils.getQueryStringFromDict', () => {
  it('builds a URL query string from defined object values and omits null/undefined', () => {
    const query = {
      symbol: 'AAPL',
      limit: 10,
      showInactive: false,
      filter: null,
      page: undefined,
    };

    const result = utils.getQueryStringFromDict(query);

    expect(result).toBe('symbol=AAPL&limit=10&showInactive=false');
  });

  it('encodes keys and values correctly', () => {
    const query = {
      'search term': 'hello world',
      'special&key': 'a+b=c',
    };

    const result = utils.getQueryStringFromDict(query);

    expect(result).toBe('search%20term=hello%20world&special%26key=a%2Bb%3Dc');
  });
});