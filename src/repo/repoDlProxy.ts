import utils from "../utils/utils";

export class repoDlProxy {
    static readonly baseUrl = "api/DlProxy";

    static Get(
        {
            stockId,
        }: {
            stockId?: string | null | undefined;
        }
    ) {
        const baseUrl = repoDlProxy.baseUrl + "/YahooChart";
        const url = baseUrl + "?" + utils.getQueryStringFromDict({ stockId });

        return {
            ...utils.reactQueryDefaults,
            queryKey: utils.getUserQueryKey({ baseUrl, stockId }),
            queryFn: utils.getReactQueryFn(url),
        };
    }
}