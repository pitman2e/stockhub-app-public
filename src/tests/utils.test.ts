import { describe, it, expect } from 'vitest';
import { AxiosError } from 'axios';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import utils from "../utils/utils";
import { getPresetDates } from '../components/DateRangeSelector';

dayjs.extend(utc);

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

describe('utils.setFormErrorFromApiError', () => {
  it('maps hook errors to their form fields and falls back to a generic error message', () => {
    const fieldErrors: Record<string, { type: string; message: string }> = {};
    const setFieldError = (fieldName: string, value: { type: string; message: string }) => {
      fieldErrors[fieldName] = value;
    };

    const hookError = new AxiosError('request failed');
    hookError.response = {
      data: {
        hookErrors: [{ fieldName: 'stockName', message: 'Stock name is required' }],
      },
    } as any;

    utils.setFormErrorFromApiError(hookError, setFieldError as any);

    expect(fieldErrors.stockName).toEqual({
      type: 'manual',
      message: 'Stock name is required',
    });

    const genericErrors: Record<string, { type: string; message: string }> = {};
    const setGenericError = (fieldName: string, value: { type: string; message: string }) => {
      genericErrors[fieldName] = value;
    };

    const fallbackError = new AxiosError('request failed');
    fallbackError.response = {
      data: {
        message: 'Server rejected input. Please verify',
      },
    } as any;

    utils.setFormErrorFromApiError(fallbackError, setGenericError as any);

    expect(genericErrors.genericErrorMsg).toEqual({
      type: 'manual',
      message: 'Server rejected input. Please verify',
    });
  });
});

describe('DateRangeSelector.getPresetDates', () => {
  it('supports dynamically generated date windows like 2D, 3W and 4Y', () => {
    const today = dayjs.utc();

    expect(getPresetDates('2D').from?.isSame(today.subtract(2, 'day'), 'day')).toBe(true);
    expect(getPresetDates('2D').to?.isSame(today.endOf('day'), 'day')).toBe(true);

    expect(getPresetDates('3W').from?.isSame(today.subtract(3, 'week'), 'day')).toBe(true);
    expect(getPresetDates('3W').to?.isSame(today.endOf('day'), 'day')).toBe(true);

    expect(getPresetDates('4Y').from?.isSame(today.subtract(4, 'year'), 'day')).toBe(true);
    expect(getPresetDates('4Y').to?.isSame(today.endOf('day'), 'day')).toBe(true);
  });
});