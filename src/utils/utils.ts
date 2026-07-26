import { getAuth } from 'firebase/auth';
import sxStyles from '../ui/sxStyles';
import axios, { AxiosResponse } from 'axios';
import { IApiActionResult } from '../types/api';
import { jwtDecode } from 'jwt-decode';
import { API_URL, DEMO_JWT } from './config';

const {
  VITE_API_URL,
  VITE_DEMO_JWT
} = import.meta.env;

export default class utils {
  static getFullUrl(url: string) {
    let api_url = API_URL || VITE_API_URL || "";

    if (api_url && !api_url.endsWith("/")) {
      api_url += "/";
    }

    return api_url + url;
  }

  static getDemoJwt = (): string => DEMO_JWT || VITE_DEMO_JWT || "";

  static getUserQueryKey(key: Record<string, string | number | undefined | boolean | null> = {}) {
    let uid: string;
    let demo_jwt = utils.getDemoJwt();

    if (!!demo_jwt) {
      uid = this.getJwtSub(demo_jwt);
    } else {
      const currentUser = getAuth().currentUser;
      if (currentUser === null) {
        throw Error("Failed to obtain Current User from Firebase API")
      }
      uid = currentUser.uid
    }

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
    let token: string;
    let demo_jwt = utils.getDemoJwt();

    if (!!demo_jwt) {
      token = demo_jwt;
    } else {
      const currentUser = getAuth().currentUser;
      if (currentUser === null) {
        throw Error("Failed to obtain Current User from Firebase API");
      }
      token = await currentUser.getIdToken();
    }

    const config = {
      method: method,
      url: this.getFullUrl(url),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      validateStatus: (_status: number) => true,
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

  static getFmtDec(val: number | undefined, decimalPlaces: number, prefix: string, suffix: string, emptyPlaceHolder: string) {
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
      const response = await utils.requestWithToken('GET', url, {});
      const apiResult = await response.data;
      if (response.status === 200) {
        return apiResult.payload as T;
      } else {
        throw apiResult as T;
      }
    }
  }

  static getReactQueryPostFn(url: string) {
    return async () => {
      const response = await utils.requestWithToken('POST', url, {});
      const apiResult = await response.data;
      if (response.status === 200) {
        return apiResult.payload;
      } else {
        throw apiResult;
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

  static isDemoMode() {
    return !!utils.getDemoJwt();
  }

  static getJwtSub(token: string): string {
    const decoded = jwtDecode<{ sub: string }>(token);
    return decoded.sub;
  }
}