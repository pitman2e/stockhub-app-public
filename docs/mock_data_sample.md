stock
```
"stock_id"	"iden"	"stock_name"	"currency"	"asset_class"	"coupon"	"maturity_date"	"coupon_freq"	"face_value"	"created_at"	"sta"	"updated_at"
"00001.HK"	1	"長和"	"HKD"	"STOCK"							
"00005.HK"	2	"匯豐控股"	"HKD"	"STOCK"							
"00006.HK"	3	"電能實業"	"HKD"	"STOCK"							
"GOOGL.US"	4	"Alphabet Inc."	"USD"	"STOCK"							
"MSFT.US"	5	"Microsoft Corporation"	"USD"	"STOCK"							
"VT.US"	6	"Vanguard Total World Stock"	"USD"	"STOCK"							
"VWRA.LSE"	7	"Vanguard FTSE All-World UCITS ETF"	"USD"	"STOCK"							
```

stock_dividend
```
"stock_id"	"announce_date"	"dividend_type"	"dividend_event"	"amount"	"ex_date"	"payable_date"	"distribution_type"	"scrip_price"	"dividend_id"	"scrip_per_count"	"currency"	"amount_adj_percentage"	"prev_amount"	"created_at"	"sta"	"updated_at"
"00001.HK"	"2026-05-27"	"D"	"01"	1.602	"2026-05-27"	"2026-05-27"	"Cash/Scrip"		5231	0	"USD"	5.81	1.514			
```

stock_portfolio
```
"portfolio_id"	"iden"	"name"	"priority"	"default_currency"	"uid"	"is_ex_summary"	"is_virtual"	"created_at"	"sta"	"updated_at"
"IB-HKD"	89	"IB (HKD)"	0	"HKD"	"TEST_UID"	false	false			
"IB-USD"	89	"IB (USD)"	0	"USD"	"TEST_UID"	false	false			
```

stock_position
```
"TEST_UID"	"IB-HKD"	"00001.HK"	627	500	"HKD"	0.0000	0.0000	0.0000	0.0000	30020.0000	"2026-09-19"	true	60.0400	6779.9992	36799.9992	30020.0000	6779.9992	325.0008	72.9500	"2026-07-31"
"TEST_UID"	"IB-HKD"	"00005.HK"	1223	500	"HKD"	0.0000	0.0000	0.0000	0.0000	15020.0000	"2026-09-19"	true	30.0400	69079.9985	84099.9985	15020.0000	69079.9985	1849.9985	164.5000	"2026-07-31"
"TEST_UID"	"IB-HKD"	"00006.HK"	1791	500	"HKD"	0.0000	0.0000	0.0000	0.0000	15020.0000	"2026-09-19"	true	30.0400	14504.9996	29524.9996	15020.0000	14504.9996	-24.9996	59.1000	"2026-07-31"
"TEST_UID"	"IB-USD"	"GOOGL.US"	2328	100	"USD"	0.0000	0.0000	0.0000	0.0000	15003.0000	"2026-09-19"	true	150.0300	20610.0005	35613.0005	15003.0000	20610.0005	2247.0001	333.6600	"2026-07-31"
"TEST_UID"	"IB-USD"	"MSFT.US"	2835	100	"USD"	0.0000	0.0000	0.0000	0.0000	30003.0000	"2026-09-19"	true	300.0300	16469.0001	46472.0001	30003.0000	16469.0001	1361.9995	451.1000	"2026-07-31"
"TEST_UID"	"IB-USD"	"VT.US"	3311	100	"USD"	0.0000	0.0000	0.0000	0.0000	18001.0000	"2026-09-19"	true	180.0100	-2414.9999	15586.0001	18001.0000	-2414.9999	41.0004	155.4500	"2026-07-31"
"TEST_UID"	"IB-USD"	"VWRA.LSE"	3757	100	"USD"	0.0000	0.0000	0.0000	0.0000	19002.0000	"2026-09-19"	true	190.0200	-260.0002	18741.9998	19002.0000	-260.0002	74.0005	186.6800	"2026-07-31"
```

stock_price
```
"stock_id"	"market_date"	"open_price"	"day_high"	"day_low"	"close_price"	"close_price_adj"	"volume"	"is_finalised"	"iden"
"00001.HK"	"2026-06-01"	69.80000305175781	70.0		69.30000305175781		9282578	true	96815
"00005.HK"	"2026-06-01"	145.6999969482422	146.5		146.3000030517578		11125038	true	97279
"00006.HK"	"2026-06-01"	60.099998474121094	60.099998474121094		58.45000076293945		9348383	true	96319
"GOOGL.US"	"2026-06-01"	376.2952290661171	378.3340198477676		376.14532470703125		28672100	true	96868
"MSFT.US"	"2026-06-01"	464.8399963378906	466.32000732421875		460.5199890136719		53628900	true	96662
"VT.US"	"2026-06-01"	158.03500366210938	159.1699981689453		158.60000610351562		3399282	true	0
"VWRA.LSE"	"2026-06-01"	191.0800018310547	191.1999969482422		190.5399932861328		211371	true	0
```

stock_transaction
```
"stock_id"	"unit_amt"	"count"	"tx_date"	"iden"	"tran_type"	"portfolio_id"	"currency"	"handling_fee"	"uid"	"comment"	"accrued_interest"	"ytm"	"is_transfer"	"tax"	"created_at"	"updated_at"	"sta"
"VWRA.LSE"	190	100	"2025-07-01"	-7	"BUY"	"IB-USD"	"USD"	-2	"TEST_UID"				false				
"VT.US"	180	100	"2025-06-01"	-6	"BUY"	"IB-USD"	"USD"	-1	"TEST_UID"				false				
"MSFT.US"	300	100	"2025-05-01"	-5	"BUY"	"IB-USD"	"USD"	-3	"TEST_UID"				false				
"GOOGL.US"	150	100	"2025-04-01"	-4	"BUY"	"IB-USD"	"USD"	-3	"TEST_UID"				false				
"00006.HK"	30	500	"2025-03-01"	-3	"BUY"	"IB-HKD"	"HKD"	-20	"TEST_UID"				false				
"00005.HK"	30	500	"2025-02-01"	-2	"BUY"	"IB-HKD"	"HKD"	-20	"TEST_UID"				false				
"00001.HK"	60	500	"2025-01-01"	-1	"BUY"	"IB-HKD"	"HKD"	-20	"TEST_UID"				false				
```

stock_watchlist
```
"stock_id"	"iden"	"priority"	"uid"	"created_at"	"sta"	"updated_at"
"00001.HK"	3	3	"TEST_UID"			
"00005.HK"	4	4	"TEST_UID"			
"GOOGL.US"	5	6	"TEST_UID"			
"MSFT.US"	5	5	"TEST_UID"			
"VT.US"	5	1	"TEST_UID"			
"VWRA.LSE"	2	2	"TEST_UID"			
```