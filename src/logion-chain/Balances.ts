import { ApiPromise } from '@polkadot/api';

export const LOG_DECIMALS = 18;

export interface GetAccountDataParameters {
    api: ApiPromise,
    accountId: string,
}

export interface AccountData {
    available: string,
    reserved: string,
}

export async function getAccountData(parameters: GetAccountDataParameters): Promise<AccountData> {
    const {
        api,
        accountId,
    } = parameters;

    const accountData = await api.query.system.account(accountId);

    return {
        available: accountData.data.free.toString(),
        reserved: accountData.data.reserved.toString(),
    };
}
