jest.mock('@polkadot/api');
jest.mock('./Signature');

import { setSignAndSend } from './__mocks__/SignatureMock';
import { ApiPromise } from '@polkadot/api';
import { setQueryRecoveryRecoverable, setQueryRecoveryActiveRecoveries } from '../__mocks__/PolkadotApiMock';
import { createRecovery, getRecoveryConfig, initiateRecovery, getActiveRecovery } from './Recovery';

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

    expect(api.tx.verifiedRecovery.createRecovery).toBeCalledWith(legalOfficers);
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

test("initiate recovery", () => {
    const api = new ApiPromise();
    const callback = jest.fn();
    const errorCallback = jest.fn();

    const signAndSend = jest.fn();
    setSignAndSend(signAndSend);

    const addressToRecover = "address";
    initiateRecovery({
        api,
        signerId: "signerId",
        callback,
        errorCallback,
        addressToRecover
    });

    expect(signAndSend).toBeCalledWith(
        expect.objectContaining({
            signerId: "signerId",
            callback,
            errorCallback,
        })
    );

    expect(api.tx.recovery.initiateRecovery).toBeCalledWith(addressToRecover);
});

test("get active recovery", async () => {
    const accountToRecover = "account1";
    const recoveringAccount = "account2";
    const expectedActiveRecovery = {};
    const activeRecovery = {
        isSome: true,
        unwrap: () => expectedActiveRecovery
    };
    const recoverable = jest.fn()
        .mockImplementation((source, dest) =>
            (source === accountToRecover && dest === recoveringAccount)
                ? Promise.resolve(activeRecovery)
                : Promise.reject());
    setQueryRecoveryActiveRecoveries(recoverable);
    const api = new ApiPromise();
    const config = await getActiveRecovery({
        api,
        sourceAccount: accountToRecover,
        destinationAccount: recoveringAccount,
    })
    expect(config).toBe(activeRecovery);
});
