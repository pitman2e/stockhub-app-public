import { getAuth } from 'firebase/auth';
import sxStyles from '../ui/sxStyles';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { IApiActionResult, IHookError } from '../types/api';
import { API_URL, DEMO_JWT } from './config';
import { apiClient, getJwtSub, getToken } from './apiClient';

const {
  VITE_API_URL,
  VITE_DEMO_JWT
} = import.meta.env;

type CamelCase<S extends string> = S extends `${infer T}_${infer U}`
  ? `${Lowercase<T>}${Capitalize<CamelCase<U>>}`
  : Lowercase<S>;

export default class utils {
  static getFullUrl(url: string) {
    let api_url = API_URL || VITE_API_URL || "";

    if (api_url && !api_url.endsWith("/")) {
      api_url += "/";
    }

    return api_url + url;
  }

  static getUserQueryKey(key: Record<string, string | number | undefined | boolean | null> = {}) {
    let uid = getJwtSub();

    const cleanedKey = Object.fromEntries(
      Object.entries(key).filter(([_, value]) => value !== null && value !== undefined && value !== "")
    )
    return [uid, cleanedKey];
  }


  static async requestWithToken(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    jsonPayload?: any
  ): Promise<AxiosResponse> {
    let jwt = getToken();

    const config = {
      method: method,
      url: this.getFullUrl(url),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`
      },
      data: jsonPayload
    };

    return axios(config);
  }

  static getQueryStringFromDict(obj: Record<string, string | number | boolean | undefined | null>) {
    const str = [];
    for (const p in obj)
      if (Object.prototype.hasOwnProperty.call(obj, p) && obj[p] !== undefined && obj[p] !== null) {
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(this.getString(obj[p])));
      }
    return str.join("&");
  }

  static getQueryRoute(...obj: (string | undefined | null)[]) {
    const str = [];
    for (const p in obj) {
      if (this.getString(p) === "") {
        break;
      }
      str.push(encodeURIComponent(this.getString(obj[p])));
    }
    return str.join("/");
  }

  static getDocumentTitle(title: string) {
    return title + " - Stock Hub";
  }

  static getString(text: string | number | boolean | undefined | null): string {
    if (text === undefined || text === null) {
      return ""
    }

    return text.toString();
  }

  static getSignedDecimal(val: number | null | undefined, decimalPlaces: number, disablePosSign: boolean = false) {
    if (val === null || val === undefined) {
      return "";
    }

    return (val > 0 && !disablePosSign ? "+" : "") + val.toFixed(decimalPlaces);
  }

  static getFmtSgnDec(val: number | null | undefined, decimalPlaces: number, prefix: string, suffix: string, emptyPlaceHolder: string = "") {
    const rtvTmp = this.getSignedDecimal(val, decimalPlaces, false);
    if (rtvTmp === "") {
      return emptyPlaceHolder;
    } else {
      return prefix + rtvTmp + suffix;
    }
  }

  static getFmtDec(val: number | null | undefined, decimalPlaces: number, prefix: string, suffix: string, emptyPlaceHolder: string) {
    let rtvTmp;

    if (val === null || val === undefined) {
      rtvTmp = "";
    } else {
      rtvTmp = val.toFixed(decimalPlaces);
    }

    if (rtvTmp === "") {
      return emptyPlaceHolder;
    } else {
      return prefix + rtvTmp + suffix;
    }
  }

  static getReactQueryFn<T = any>(url: string): () => Promise<T> {
    return async () => {
      const response = await apiClient.get(url);
      const apiResult = await response.data;
      if (response.status === 200) {
        return apiResult.payload as T;
      } else {
        throw apiResult as T;
      }
    }
  }

  static getColorClass = (amount: number | null | undefined) => {
    if (amount === undefined || amount === null || amount === 0) {
      return null;
    }
    if (amount > 0) {
      return sxStyles.deltaUp;
    }
    else if (amount < 0) {
      return sxStyles.deltaDown;
    }

    return null;
  }

  static reactQueryDefaults: {
    refetchOnWindowFocus: boolean,
    refetchInterval: false,
    retry: (failureCount: number, error: any) => boolean
  } = {
      refetchOnWindowFocus: false,
      refetchInterval: false,
      retry: (failureCount: number, error: any): boolean => {
        //Error is the response object from the server
        //Does not have a status code
        if (error.status === 400 || !error.isSuccess) {
          return false;
        }

        //Total query count will be 4, 1st is the original query, 3 retries
        return failureCount < 3;
      },
    }

  static round2Dec(inp: number, decPlace: number): number {
    const decPlace10 = Math.pow(10, decPlace)
    return Math.round((inp + Number.EPSILON) * decPlace10) / decPlace10
  }

  static getErrorMessage(err: IApiActionResult<any>) {
    if (err?.message) {
      return err.message;
    }

    if (err?.hookErrors?.length) {
      return err.hookErrors
        .map((e) => `${e.message} (${e.fieldName})`)
        .join('; ');
    }

    return undefined
  }

  // TODO: Remove usage of any
  static getApiErrorMessage(error: AxiosError<any>) {
    const actionResult = error.response?.data as {
      hookErrors?: IHookError<any>[];
      message?: string;
    } | undefined;

    if (actionResult?.hookErrors?.length) {
      return actionResult.hookErrors
        .map((hookError) => hookError.message)
        .join('; ');
    }

    return actionResult?.message ?? error.message ?? "Server rejected input. Please verify";
  }


  // TODO: Typing has no particular meaning?
  static setFormErrorFromApiError<TFieldValues extends FieldValues>(
    error: AxiosError<any>,
    setError: UseFormSetError<TFieldValues>,
  ) {
    const actionResult = error.response?.data as {
      hookErrors?: IHookError<TFieldValues>[];
      message?: string;
    } | undefined;

    if (actionResult?.hookErrors?.length) {
      actionResult.hookErrors.forEach((hookError) => {
        var camelCaseFieldName = utils.toCamelCase(hookError.fieldName as string);
        // Workaround API having thousands of way to not returning camelCase fieldName
        if (camelCaseFieldName !== hookError.fieldName) {
          console.warn(`Field name '${hookError.fieldName as string}' is not in camelCase. Using '${camelCaseFieldName}' instead.`);
        }

        setError(camelCaseFieldName as Path<TFieldValues>, {
          type: "manual",
          message: hookError.message,
        });
      });
    } else {
      setError("genericErrorMsg" as Path<TFieldValues>, {
        type: "manual",
        message: utils.getApiErrorMessage(error),
      });
    }
  }

  static getEmptyRowsCountForLastPage({
    pageIndex,
    pageSize,
    rowCount,
    currentPageRowCount,
  }: {
    pageIndex: number;
    pageSize: number;
    rowCount: number;
    currentPageRowCount: number;
  }) {
    if (pageIndex <= 0 || rowCount === 0) {
      return 0;
    }

    const lastPageIndex = Math.ceil(rowCount / pageSize) - 1;
    if (pageIndex < lastPageIndex || currentPageRowCount >= pageSize) {
      return 0;
    }

    return pageSize - currentPageRowCount;
  }

  static toCamelCase<S extends string>(str: S): CamelCase<S> {
    if (str === "") {
      return "" as CamelCase<S>;
    }

    if (!str.includes("_")) {
      return /^[A-Z0-9]+$/.test(str) ? str.toLowerCase() as CamelCase<S> : str as unknown as CamelCase<S>;
    }

    const parts = str.split("_").filter(Boolean);
    const camelCase = parts
      .map((part, index) => {
        const normalized = part.toLowerCase();

        if (index === 0 && str.startsWith("_")) {
          return normalized.charAt(0).toUpperCase() + normalized.slice(1);
        }

        if (index === 0) {
          return normalized;
        }

        return normalized.charAt(0).toUpperCase() + normalized.slice(1);
      })
      .join("");

    return (str.endsWith("_") ? `${camelCase}_` : camelCase) as CamelCase<S>;
  }
}