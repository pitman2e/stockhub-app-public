import { object, string, boolean, number, array, InferType } from 'yup';
import {
  IStockAssetClassType,
  ITransactionType,
  IBaseDtoSchema,
  IStockSchema,
  IStockPositionSchema,
  IStockAssetClassTypeSchema,
  ITransactionTypeSchema,
  IStockPortfolioSchema,
} from './db';

export interface IHookError {
  fieldName: string;
  message: string;
}

export interface IApiActionResult<T = undefined> {
  isSuccess: boolean;
  message: string;
  timestamp: number;
  hookErrors: IHookError[];
  payload: T;
}

export interface IPagedApiResult<T> {
  tableData: T[];
  pageNo: number;
  rowsPerPage: number;
  totalCount: number;
}

export interface IPositionChartData {
  labels?: string[];
  unrealisedDatasets: IChartJsDataSet[];
  totalGainDatasets: IChartJsDataSet[];
  totalGainOffsetDatasets: IChartJsDataSet[];
  dailyGainDatasets: IChartJsDataSet[];
  unrealisedCostDatasets: IChartJsDataSet[];
  dailyRealisedDividendDatasets: IChartJsDataSet[];
}

export const IWatchlistDeleteDtoSchema = object({
  stockId: string().max(20).required(),
});
export type IWatchlistDeleteDto = InferType<typeof IWatchlistDeleteDtoSchema>;

export const IWatchlistPostDtoSchema = object({
  stockId: string().max(20).required(),
  priority: number().required(),
});
export type IWatchlistPostDto = InferType<typeof IWatchlistPostDtoSchema>;

export const IStockMovementSchema = object({
  stockName: string().max(80).required(),
  stockId: string().max(20).required(),
  price: number().required(),
  priceChange: number().required(),
  priceChangePercentage: number().required(),
});
export type IStockMovement = InferType<typeof IStockMovementSchema>;

export const IStockMovementsSchema = object({
  watchlists: array(IStockMovementSchema).required(),
});
export type IStockMovements = InferType<typeof IStockMovementsSchema>;

export const IStockTopMoversSchema = object({
  byUpPercentage: array(IStockMovementSchema).required(),
  byDownPercentage: array(IStockMovementSchema).required(),
});
export type IStockTopMovers = InferType<typeof IStockTopMoversSchema>;

export const IChartJsDataSetSchema = object({
  data: array(number().required()).required(),
  customBackgroundColor: array(string().required()).required(),
  currency: string().max(3).required(),
});
export type IChartJsDataSet = InferType<typeof IChartJsDataSetSchema>;

export const IChartJsDataSetsSchema = object({
  datasets: array(IChartJsDataSetSchema).required(),
  labels: array(string().required()).required(),
});
export type IChartJsDataSets = InferType<typeof IChartJsDataSetsSchema>;

export const IPortfolioPostDtoSchema = IBaseDtoSchema.concat(
  object({
    portfolioId: string().max(20).required(),
    portfolioName: string().required(),
    defaultCurrency: string().max(3).required(),
    priority: number().required(),
    isVirtual: boolean().required(),
    version: number().required(),
    childPortfolioIds: array(string().max(20).required()).required(),
  })
);
export type IPortfolioPostDto = InferType<typeof IPortfolioPostDtoSchema>;

export const IStockPriceDatasetSchema = object({
  data: array(number().required()).required(),
  fill: boolean().required(),
  label: string().required(),
});
export type IStockPriceDataset = InferType<typeof IStockPriceDatasetSchema>;

export const IStockPriceDatasetsSchema = object({
  stockPriceDatasets: array(IStockPriceDatasetSchema).required(),
  labels: array(string().required()).required(),
});
export type IStockPriceDatasets = InferType<typeof IStockPriceDatasetsSchema>;

export const IPerformanceSchema = object({
  stock: IStockSchema.required(),
  ytd: number().nullable().defined(),
  oneYear: number().nullable().defined(),
  threeYear: number().nullable().defined(),
  fiveYear: number().nullable().defined(),
  oneMonth: number().nullable().defined(),
  threeMonth: number().nullable().defined(),
  dropFromTop: number().nullable().defined(),
});
export type IPerformance = InferType<typeof IPerformanceSchema>;

export const IRealisedScripPutDtoSchema = IBaseDtoSchema.concat(
  object({
    portfolioId: string().max(20).required(),
    dividendId: number().required(),
    scripReceived: number().required(),
    reinvestPrice: number().nullable().defined(),
  })
);
export type IRealisedScripPutDto = InferType<typeof IRealisedScripPutDtoSchema>;

export const ITransactionBaseDtoSchema = IBaseDtoSchema.concat(
  object({
    iden: number().required(),
    portfolioId: string().max(20).required(),
    unitAmt: number().defined().required(),
    txCount: number().defined().required(),
    stockId: string().max(20).required(),
    txDate: string().required(),
    tranType: ITransactionTypeSchema.required(),
    isTransfer: boolean().required(),
    handlingFee: number().nullable().optional(),
    accruedInterest: number().nullable().optional(),
    tax: number().nullable().optional(),
    ytm: number().nullable().optional(),
    comment: string().nullable().optional(),
    version: number().required(),
    txAmount: number().nullable().optional(), // Not exist in API
  })
);

export const ITransactionPostDtoSchema = ITransactionBaseDtoSchema;
export type ITransactionPostDto = InferType<typeof ITransactionPostDtoSchema>;

export const ITransactionPutDtoSchema = ITransactionBaseDtoSchema;
export type ITransactionPutDto = InferType<typeof ITransactionPutDtoSchema>;

export const IStockPositionValueSchema = IStockPositionSchema.concat(
  object({
    stockName: string().max(80).required(),
    assetClass: IStockAssetClassTypeSchema.required(),
    stockPrice: number().nullable().defined(),
    dailyRealisedDividend: number().required(),
    currentGainPercentage: number().nullable().defined(),
  })
);
export type IStockPositionValue = InferType<typeof IStockPositionValueSchema>;

export const IStockSummarySchema = object({
  portfolio: IStockPortfolioSchema.required(),
  childPortfolioIds: array(string().max(20).required()).optional(),
  marketDate: string().nullable().defined(), /** Format: YYYY-MM-DD */
  totalCost: number().required(),
  totalDividend: number().required(),
  totalRealisedAmount: number().required(),

  /** @deprecated No longer used at API */
  totalUnrealisedGainPercentage: number().nullable().optional(),
  /** @deprecated No longer used at API */
  totalUnrealisedGain: number().required(),

  curTxGainAmount: number().required(),
  curTxGainAmountLatest: number().required(),
  curTxGainAmountPercentage: number().nullable().defined(),
  curTxGainAmountLatestPercentage: number().nullable().defined(),
  totalRealisedGain: number().required(),
  totalUnrealisedAmount: number().required(),
  displayCurrency: string().max(3).required(),
  totalGain: number().required(),
  totalGainPercentage: number().nullable().defined(),
  totalRealisedGainPercentage: number().nullable().defined(),
  totalYtdGain: number().required(),
  totalYtdGainPercentage: number().nullable().defined(),
  totalUnrealisedAmountPrev: number().required(),
  totalUnrealisedCost: number().required(),
  totalRealisedCost: number().required(),
});
export type IStockSummary = InferType<typeof IStockSummarySchema>;

export const IPortfoliosSummarySchema = object({
  summary: IStockSummarySchema.required(),
  details: array(IStockSummarySchema).required(),
  closedDetails: array(IStockSummarySchema).required(),
  virtualPortfolioDetails: array(IStockSummarySchema).required(),
});
export type IPortfoliosSummary = InferType<typeof IPortfoliosSummarySchema>;

const IStockBaseDtoSchema = IBaseDtoSchema.concat(
  object({
    stockName: string().max(80).required(),
    currency: string().max(3).required(),
    assetClass: IStockAssetClassTypeSchema.required(),
    coupon: number().nullable().optional(),
    couponFreq: number().nullable().optional(),
    maturityDate: string(),
    faceValue: number().integer().min(-999999).max(999999).nullable().optional(),
  })
);

export const IStockPutDtoSchema = IStockBaseDtoSchema.concat(
  object({
    key_stockId: string().max(20).required(),
    stockId: string().max(20).required(),
    version: number().required(),
  })
);
export type IStockPutDto = InferType<typeof IStockPutDtoSchema>;

export const IStockPostDtoSchema = IStockBaseDtoSchema.concat(
  object({
    stockId: string().max(20).required(),
  })
);
export type IStockPostDto = InferType<typeof IStockPostDtoSchema>;

export const ITransactionGetDtoSchema = IBaseDtoSchema.concat(
  object({
    iden: number().required(),
    portfolioId: string().max(20).required(),
    unitAmt: number().required(),
    txCount: number().required(),
    stockId: string().max(20).required(),
    txDate: string().required(),
    tranType: ITransactionTypeSchema.required(),
    currency: string().max(3).required(),
    isTransfer: boolean().required(),
    handlingFee: number().nullable().optional(),
    accruedInterest: number().nullable().optional(),
    tax: number().nullable().optional(),
    ytm: number().nullable().optional(),
    comment: string().nullable().optional(),
    stockName: string().max(80).optional(),
    version: number().required(),
  })
);
export type ITransactionGetDto = InferType<typeof ITransactionGetDtoSchema>;

export const IDividendPutDtoSchema = object({
  dividendId: number().required(),
  scripPrice: number().nullable().defined(),
});
export type IDividendPutDto = InferType<typeof IDividendPutDtoSchema>;

export const ITagCsvPostDtoSchema = object({
  category: string().required(),
  csv: string().required(),
});
export type ITagCsvPostDto = InferType<typeof ITagCsvPostDtoSchema>;

export const IProblemDetailsSchema = object({
  type: string().optional(),
  title: string().optional(),
  status: number().optional(),
  detail: string().optional(),
  instance: string().optional(),
});
// Extends the inferred type to map the [key: string]: unknown dictionary safely
export type IProblemDetails = InferType<typeof IProblemDetailsSchema> & {
  [key: string]: unknown;
};

export const txTypes: { display: string; value: ITransactionType }[] = [
  { display: "Buy", value: "BUY" },
  { display: "Sell", value: "SELL" },
  { display: "Reinv", value: "REINV" },
  { display: "Div", value: "DIV" },
  { display: "Cash", value: "CASH" },
];

export const currencies: { display: string; value: string }[] = [
  { display: "USD", value: "USD" },
  { display: "HKD", value: "HKD" },
];

export const markets: { display: string; value: string }[] = [
  { display: "US", value: "US" },
  { display: "LSE", value: "LSE" },
  { display: "USBND", value: "USBND" },
  { display: "CASH", value: "CASH" },
  { display: "HKBND", value: "HKBND" },
  { display: "HK", value: "HK" },
  { display: "PCP", value: "PCP" },
  { display: "HSBC", value: "HSBC" },
  { display: "MANU", value: "MANU" },
];

export const assetClasses: { display: string; value: IStockAssetClassType }[] = [
  { display: "Stock", value: "STOCK" },
  { display: "Bond", value: "BOND" },
  { display: "Manual", value: "MANUAL" },
];