jest.mock('@polkadot/api');

import { ApiPromise } from '@polkadot/api';

import {
    getAccountData,
    getBalances,
} from './Balances';
import { PrefixedNumber, ATTO, NONE } from './numbers';

test("Getting account data", async () => {
    const api = new ApiPromise();
    const accountId = "accountId";

    const data = await getAccountData({
        api,
        accountId
    });

    expect(data.available).toBe("42");
    expect(data.reserved).toBe("0");
});

test("Getting balances", async () => {
    const api = new ApiPromise();
    const accountId = "accountId";

    const data = await getBalances({
        api,
        accountId
    });

    expect(data[0].balance).toStrictEqual(new PrefixedNumber("42", ATTO));
    expect(data[0].coin.id).toBe("lgnt");
    expect(data[0].level).toBe(0.42000000000000004);

    expect(data[1].balance).toStrictEqual(new PrefixedNumber("0", NONE));
    expect(data[1].coin.id).toBe("dot");
    expect(data[1].level).toBe(1);
});
