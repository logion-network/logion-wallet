jest.mock('@polkadot/api');
jest.mock('./Signature');

import { setSignAndSend } from './Signature';
import { ApiPromise, setQueryRecoveryRecoverable } from '@polkadot/api';
import { createRecovery, getRecoveryConfig } from './Recovery';
import { Option } from '@polkadot/types';

test("recovery creation", () => {
    const api = new ApiPromise();
    const callback = jest.fn();
    const errorCallback = jest.fn();

    const signAndSend = jest.fn();
    setSignAndSend(signAndSend);

    const legalOfficers = ["1", "2"];
    createRecovery({
        api,
        signerId: "signerId",
        callback,
        errorCallback,
        legalOfficers,
    });

    expect(signAndSend).toBeCalledWith(
        expect.objectContaining({
            signerId: "signerId",
            callback,
            errorCallback,
        })
    );

    expect(api.tx.recovery.createRecovery).toBeCalledWith(legalOfficers, 1, 0);
});

test("get recovery config", async () => {
    const accountId = "account";
    const expectedRecoveryConfig = {};
    const recoveryConfig = {
        isSome: true,
        unwrap: () => expectedRecoveryConfig
    };
    const recoverable = jest.fn()
        .mockImplementation(targetAccountId => targetAccountId === accountId ? Promise.resolve(recoveryConfig) : Promise.reject());
    setQueryRecoveryRecoverable(recoverable);
    const api = new ApiPromise();
    const config = await getRecoveryConfig({
        api,
        accountId
    })
    expect(config).toBe(recoveryConfig);
});
