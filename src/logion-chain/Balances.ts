import { ApiPromise } from '@polkadot/api';
import { PrefixedNumber, ScientificNumber, convertToPrefixed, NONE } from "./numbers";

const LOG_DECIMALS = 18;

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
export interface Coin {
    id: string,
    name: string,
    iconId: string,
    iconType: 'svg' | 'png',
    symbol: string,
}

export interface CoinBalance {
    coin: Coin,
    balance: PrefixedNumber,
    level: number,
}

export async function getBalances(parameters: GetAccountDataParameters): Promise<CoinBalance[]> {
    const {
        api,
        accountId,
    } = parameters;

    const data = await getAccountData({
        api: api!,
        accountId,
    });

    const logAvailable = scientificLogBalance(data.available).optimizeScale(3);
    const logPrefixedAvailable = convertToPrefixed(logAvailable);
    const logLevel = logAvailable.divideBy(ARTIFICIAL_MAX_BALANCE).toNumber();

    return [
        buildCoinBalance('log', logPrefixedAvailable, logLevel),
        buildCoinBalance('dot', new PrefixedNumber("0", NONE), 1)
    ];
}

export function scientificLogBalance(tokens: string): ScientificNumber {
    return new ScientificNumber(tokens, -LOG_DECIMALS).optimizeScale(3);
}

export function prefixedLogBalance(tokens: string): PrefixedNumber {
    const scientific = scientificLogBalance(tokens);
    return convertToPrefixed(scientific);
}

const ARTIFICIAL_MAX_BALANCE = scientificLogBalance("100");

function buildCoinBalance(coinId: string, balance: PrefixedNumber, level: number): CoinBalance {
    const coin = getCoin(coinId);
    return {
        coin,
        balance,
        level,
    }
}

export function getCoin(coinId: string): Coin {
    if(coinId === 'dot') {
        return {
            id: 'dot',
            name: 'Polkadot',
            iconId: 'dot',
            iconType: 'png',
            symbol: 'DOT',
        };
    } else if(coinId === "log") {
        return {
            id: 'log',
            name: 'Logion',
            iconId: 'log',
            iconType: 'png',
            symbol: 'LOG',
        };
    } else {
        throw new Error(`Unsupported coin ${coinId}`);
    }
}
