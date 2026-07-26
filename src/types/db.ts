export interface IStockPortfolio {
  name: string;
  portfolioId: string;
  isVirtual: boolean;
  version: number;
}

export interface IBaseDto {
  genericErrorMsg?: string;
}

export type ITransactionType = 'BUY' | 'SELL' | 'DIV' | 'REINV' | 'CASH';

export interface RealisedDividend {
  portfolioId: string;
  stockId: string;
  stockName: string;
  exDate: string;
  payDate: string;
  dividendId: number;
  dividendType: string;
  cnt: number;
  payPerUnit: number;
  dividendYield: number;
  amountAdjPercentage: number | null;
  distributionType: string;
  scripReceived: number;
  reinvestPrice: number | null;
  isMissingScripPrice: boolean;
  currency: string;
  totalAmt: number;
}

export interface IStockPosition {
  portfolioId: string;
  stockId: string;
  quantity: number;
  averageCost: number | null;
  unrealisedAmount: number;
  realisedAmount: number;
  unrealisedGain: number;
  realisedGain: number;
  realisedDividend: number;
  currency: string;
  unrealisedCost: number;
  realisedCost: number;
  totalCost: number;
  totalGain: number;
  marketDate: string | null;
  observeDate: string;
  currentGain: number;
  prevStockPrice: number | null;
  isLatest: boolean;
  totalGainPercentage: number | null;
  isTradingDay: boolean;
  unrealisedGainPercentage: number | null;
}

export interface IStock {
  stockId: string;
  stockName: string;
  currency: string;
  assetClass: IStockAssetClassType;
  coupon: number | null;
  couponFreq: number | null;
  maturityDate: string | null;
  faceValue : number | null;
  version: number;
}

export interface IStockDividend {
  dividendId: number;
  stockId: string;
  announceDate: string;
  dividendEvent: string;
  dividendType: string;
  distributionType: IDivDistType;
  amount: number | null;
  scripPrice: number | null;
  exDate: string | Date;
  payableDate: string | Date;
  scripPerCount: number;
  currency: string;
  prevAmount?: number | null;
  amountAdjPercentage?: number | null;
}

export type IDivDistType = 'Scrip' | 'Cash' | 'Cash/Scrip' | 'D' | 'B';

export type IStockAssetClassType = 'STOCK' | 'BOND' | 'MANUAL';