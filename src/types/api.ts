import { IBaseDto, IStock, IStockAssetClassType, IStockPosition, ITransactionType } from "./db";

export interface IHookError<T> {
  fieldName: keyof T;
  message: string;
}

export interface IApiActionResult<T> {
  isSuccess: boolean;
  message: string;
  timestamp: number;
  hookErrors: IHookError<keyof T>[];
  payload: T;
}

export interface IStockMovements {
  watchlists: IStockMovement[];
}

export interface IStockMovement {
  stockName: string;
  stockId: string;
  price: number;
  priceChange: number;
  priceChangePercentage: number
}

export interface IStockTopMovers {
  byUpPercentage: IStockMovement[];
  byDownPercentage: IStockMovement[];
}

export interface IChartJsDataSet {
  data: number[];
  customBackgroundColor: string[];
  currency: string;
}

export interface IChartJsDataSets {
  datasets: IChartJsDataSet[];
  labels: string[];
}

export interface IPortfolioPostDto extends IBaseDto {
  portfolioId: string;
  portfolioName: string;
  defaultCurrency: string;
  isVirtual: boolean;
  version: number;
}

export interface IStockPriceDataset {
  data: number[];
  fill: boolean;
  label: string;
}

export interface IStockPriceDatasets {
  stockPriceDatasets: IStockPriceDataset[]
  labels: string[]
}

export interface IPerformance {
  stock: IStock;
  ytd: number | null;
  oneYear: number | null;
  threeYear: number | null;
  fiveYear: number | null;
  oneMonth: number | null;
  threeMonth: number | null;
  dropFromTop: number | null;
}

export interface IRealisedScripPutDto extends IBaseDto {
  portfolioId: string;
  dividendId: number;
  scripReceived: number;
  reinvestPrice: number | null;
}

interface ITransactionBaseDto extends IBaseDto {
  iden: number;
  portfolioId: string;
  unitAmt: number | null;
  txCount: number | null;
  stockId: string;
  txDate: string;
  tranType: ITransactionType;
  currency: string;
  isTransfer: boolean;
  stockName: string;
  handlingFee?: number | null;
  accruedInterest?: number | null;
  tax?: number | null;
  ytm?: number | null;
  comment?: string | null;
  version: number;

  txAmount: number | null; //Not exist in API
  isClone?: boolean | null; //Not exist in API
}

export type ITransactionPostDto = ITransactionBaseDto
export type ITransactionPutDto = ITransactionBaseDto

export interface IStockPositionValue extends IStockPosition {
  stockName: string;
  assetClass: IStockAssetClassType;
  stockPrice: number | null;
  dailyRealisedDividend: number;
  currentGainPercentage: number | null;
}

export interface IPagedApiResult<T> {
  tableData: T[];
  pageNo: number;
  rowsPerPage: number;
  totalCount: number;
}

export interface IStockSummary {
  portfolioId: string;
  marketDate: string | null; /** Format: YYYY-MM-DD */
  totalCost: number;
  totalDividend: number;
  totalRealisedAmount: number;

  /** @deprecated No longer used at API */
  totalUnrealisedGainPercentage?: number | null;
  /** @deprecated No longer used at API */
  totalUnrealisedGain: number;

  curTxGainAmount: number;
  curTxGainAmountLatest: number;
  portfolioName: string;
  curTxGainAmountPercentage: number | null;
  curTxGainAmountLatestPercentage: number | null;
  totalRealisedGain: number;
  totalUnrealisedAmount: number;
  displayCurrency: string;
  totalGain: number;
  totalGainPercentage: number | null;
  totalRealisedGainPercentage: number | null;
  totalYtdGain: number;
  totalYtdGainPercentage: number | null;
  portfolioCurrency: string;
  totalUnrealisedAmountPrev: number;
  totalUnrealisedCost: number;
  totalRealisedCost: number;
  isExcludedFromSummary: boolean;
  isVirtual: boolean;
  version: number;
}

export interface IPortfoliosSummary {
  summary: IStockSummary;
  details: IStockSummary[];
  closedDetails: IStockSummary[];
  virtualPortfolioDetails: IStockSummary[];
}

interface IStockBaseDto extends IBaseDto {
  stockName: string;
  currency: string;
  assetClass: IStockAssetClassType;
  coupon: string;
  couponFreq: string;
  maturityDate: string;
  faceValue : string;
}

export interface IStockPutDto extends IStockBaseDto {
  key_stockId: string;
  stockId: string;
  version: number;
}

export interface IStockPostDto extends IStockBaseDto {
  stockId: string;
}

export const txTypes: { display: string, value: ITransactionType }[] = [
  { display: "Buy", value: "BUY" },
  { display: "Sell", value: "SELL" },
  { display: "Reinv", value: "REINV" },
  { display: "Div", value: "DIV" },
  { display: "Cash", value: "CASH" },
];

export interface ITransactionGetDto extends IBaseDto {
  iden: number;
  portfolioId: string;
  unitAmt: number;
  txCount: number;
  stockId: string;
  txDate: string;
  tranType: ITransactionType;
  currency: string;
  isTransfer: boolean;
  handlingFee?: number | null;
  accruedInterest?: number | null;
  tax?: number | null;
  ytm?: number | null;
  comment?: string | null;
  stockName?: string;
  version: number;
}

export interface IDividendPutDto {
  dividendId: number;
  scripPrice: number | null;
}