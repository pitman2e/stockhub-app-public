import { object, string, boolean, number, mixed, InferType } from 'yup';

export const IBaseDtoSchema = object({
  genericErrorMsg: string().optional(),
});
export type IBaseDto = InferType<typeof IBaseDtoSchema>;

export const ITransactionTypeSchema = string()
  .oneOf(['BUY', 'SELL', 'DIV', 'REINV', 'CASH'] as const)
  .required();
export type ITransactionType = InferType<typeof ITransactionTypeSchema>;

export const IStockPortfolioSchema = object({
  name: string().required(),
  portfolioId: string().max(20).required(),
  defaultCurrency: string().max(3).required(),
  priority: number().required(),
  isExcludedFromSummary: boolean().required(),
  isVirtual: boolean().required(),
  version: number().required(),
});
export type IStockPortfolio = InferType<typeof IStockPortfolioSchema>;

export const RealisedDividendSchema = object({
  portfolioId: string().max(20).required(),
  stockId: string().max(20).required(),
  stockName: string().max(80).required(),
  exDate: string().required(),
  payDate: string().required(),
  dividendId: number().required(),
  dividendType: string().max(10).required(),
  cnt: number().required(),
  payPerUnit: number().required(),
  dividendYield: number().required(),
  amountAdjPercentage: number().nullable().defined(),
  distributionType: string().max(10).required(),
  scripReceived: number().required(),
  reinvestPrice: number().nullable().defined(),
  isMissingScripPrice: boolean().required(),
  currency: string().max(3).required(),
  totalAmt: number().required(),
});
export type RealisedDividend = InferType<typeof RealisedDividendSchema>;

export const IStockPositionSchema = object({
  portfolioId: string().max(20).required(),
  stockId: string().max(20).required(),
  quantity: number().required(),
  averageCost: number().nullable().defined(),
  unrealisedAmount: number().required(),
  realisedAmount: number().required(),
  unrealisedGain: number().required(),
  realisedGain: number().required(),
  realisedDividend: number().required(),
  currency: string().max(3).required(),
  unrealisedCost: number().required(),
  realisedCost: number().required(),
  totalCost: number().required(),
  totalGain: number().required(),
  marketDate: string().nullable().defined(),
  observeDate: string().required(),
  currentGain: number().required(),
  prevStockPrice: number().nullable().defined(),
  isLatest: boolean().required(),
  totalGainPercentage: number().nullable().defined(),
  isTradingDay: boolean().required(),
  unrealisedGainPercentage: number().nullable().defined(),
});
export type IStockPosition = InferType<typeof IStockPositionSchema>;

export const IStockAssetClassTypeSchema = string()
  .oneOf(['STOCK', 'BOND', 'MANUAL'] as const)
  .required();
export type IStockAssetClassType = InferType<typeof IStockAssetClassTypeSchema>;

export const IStockSchema = object({
  stockId: string().max(20).required(),
  stockName: string().max(80).required(),
  currency: string().max(3).required(),
  assetClass: IStockAssetClassTypeSchema.required(),
  coupon: number().optional(),
  couponFreq: number().optional(),
  maturityDate: string().required(),
  faceValue: number().integer().min(0).max(999999).optional(),
  version: number().required(),
});
export type IStock = InferType<typeof IStockSchema>;

export const IDivDistTypeSchema = string()
  .oneOf(['Scrip', 'Cash', 'Cash/Scrip', 'D', 'B'] as const)
  .required();
export type IDivDistType = InferType<typeof IDivDistTypeSchema>;

export const IStockDividendSchema = object({
  dividendId: number().required(),
  stockId: string().max(20).required(),
  announceDate: string().required(),
  dividendEvent: string().max(10).required(),
  dividendType: string().max(10).required(),
  distributionType: IDivDistTypeSchema.max(10).required(),
  amount: number().nullable().defined(),
  scripPrice: number().nullable().defined(),
  exDate: mixed<string | Date>().defined(),
  payableDate: mixed<string | Date>().defined(),
  scripPerCount: number().required(),
  currency: string().max(3).required(),
  prevAmount: number().nullable().optional(),
  amountAdjPercentage: number().nullable().optional(),
});
export type IStockDividend = InferType<typeof IStockDividendSchema>;