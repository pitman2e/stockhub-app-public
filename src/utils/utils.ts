import sxStyles from '../ui/sxStyles';
import { AxiosError, isAxiosError } from 'axios';
import { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { IApiActionResult, IHookError } from '../types/api';
import { getJwtSub } from './apiClient';

type CamelCase<S extends string> = S extends `${infer T}_${infer U}`
  ? `${Lowercase<T>}${Capitalize<CamelCase<U>>}`
  : Lowercase<S>;

export function getUserQueryKey(key: Record<string, string | number | undefined | boolean | null> = {}) {
  const uid = getJwtSub();

  const cleanedKey = Object.fromEntries(
    Object.entries(key).filter(([_, value]) => value !== null && value !== undefined && value !== "")
  );
  return [uid, cleanedKey];
}

export function getQueryStringFromDict(obj: Record<string, string | number | boolean | undefined | null>) {
  const str = [];
  for (const p in obj)
    if (Object.prototype.hasOwnProperty.call(obj, p) && obj[p] !== undefined && obj[p] !== null) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(getString(obj[p])));
    }
  return str.join("&");
}

export function getQueryRoute(...obj: (string | undefined | null)[]) {
  const str = [];
  for (const p in obj) {
    if (getString(p) === "") {
      break;
    }
    str.push(encodeURIComponent(getString(obj[p])));
  }
  return str.join("/");
}

export function getDocumentTitle(title: string) {
  return title + " - Stock Hub";
}

export function getString(text: string | number | boolean | undefined | null): string {
  if (text === undefined || text === null) {
    return "";
  }

  return text.toString();
}
export function getSignedDecimal(val: number | null | undefined, decimalPlaces: number, disablePosSign: boolean = false) {
  if (val === null || val === undefined) {
    return "";
  }

  return (val > 0 && !disablePosSign ? "+" : "") + val.toFixed(decimalPlaces);
}

export function getFmtSgnDec(val: number | null | undefined, decimalPlaces: number, prefix: string, suffix: string, emptyPlaceHolder: string = "") {
  const rtvTmp = getSignedDecimal(val, decimalPlaces, false);
  if (rtvTmp === "") {
    return emptyPlaceHolder;
  } else {
    return prefix + rtvTmp + suffix;
  }
}

export function getFmtDec(val: number | null | undefined, decimalPlaces: number, prefix: string, suffix: string, emptyPlaceHolder: string) {
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

export const getColorClass = (amount: number | null | undefined) => {
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

export const reactQueryDefaults: {
  refetchOnWindowFocus: boolean,
  refetchInterval: false,
  retry: (failureCount: number, error: Error) => boolean
} = {
  refetchOnWindowFocus: false,
  refetchInterval: false,
  retry: (_failureCount, _error): boolean => {
    return false;
  },
}

export function round2Dec(inp: number, decPlace: number): number {
  const decPlace10 = Math.pow(10, decPlace);
  return Math.round((inp + Number.EPSILON) * decPlace10) / decPlace10;
}

export function getApiErrorMessage(error: Error) {
  if (isAxiosError<{ hookErrors?: IHookError[]; message?: string }>(error)) {
    const actionResult = error.response?.data;

    if (actionResult?.hookErrors?.length) {
      return actionResult.hookErrors
        .map((hookError) => hookError.message)
        .join('; ');
    }

    return actionResult?.message ?? error.message ?? "Server rejected input. Please verify";
  }

  return error.message ?? "Server rejected input. Please verify";
}

export function setFormErrorFromApiError<TFieldValues extends FieldValues>(
  error: AxiosError<IApiActionResult>,
  setError: UseFormSetError<TFieldValues>,
) {
  const actionResult = error.response?.data;

  if (actionResult?.hookErrors?.length) {
    actionResult.hookErrors.forEach((hookError) => {
      const camelCaseFieldName = toCamelCase(hookError.fieldName as string);
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
      message: getApiErrorMessage(error),
    });
  }
}

export function getEmptyRowsCountForLastPage({
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
export function toCamelCase<S extends string>(str: S): CamelCase<S> {
  if (str === "") {
    return "" as CamelCase<S>;
  }

  if (!str.includes("_")) {
    return /^[A-Z0-9]+$/.test(str) ? str.toLowerCase() as CamelCase<S> : str as S & CamelCase<S>;
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
