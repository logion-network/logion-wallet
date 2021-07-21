jest.mock('@polkadot/api');

import { ApiPromise } from '@polkadot/api';

import {
    getAccountData
} from './Balances';

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
