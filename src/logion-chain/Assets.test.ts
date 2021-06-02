jest.mock('@polkadot/api');
jest.mock('./Signature');

import BN from 'bn.js';
import { ApiPromise } from '@polkadot/api';
import {
    createAsset,
    setAssetMetadata,
    mintTokens,
    mintAmount,
} from './Assets';

test("Creation of new asset", async () => {
    const api = new ApiPromise();
    const callback = jest.fn();
    const errorCallback = jest.fn();

    const { assetId, unsubscriber } = await createAsset({
        api,
        signerId: "signerId",
        callback,
        errorCallback,
    });

    expect(assetId).toBeDefined();
    expect(unsubscriber).toBeDefined();
});

test("Setting metadata", () => {
    const api = new ApiPromise();
    const callback = jest.fn();
    const errorCallback = jest.fn();
    const assetId = new BN(42);

    const unsubscriber = setAssetMetadata({
        api,
        signerId: "signerId",
        callback,
        errorCallback,
        assetId,
        metadata: {
            name: "",
            symbol: "",
            decimals: 18
        }
    });

    expect(assetId).toBeDefined();
    expect(unsubscriber).toBeDefined();
});

test("Minting", () => {
    const api = new ApiPromise();
    const callback = jest.fn();
    const errorCallback = jest.fn();
    const assetId = new BN(42);
    const amount = new BN(42);

    const unsubscriber = mintTokens({
        api,
        signerId: "signerId",
        beneficiary: "beneficiary",
        callback,
        errorCallback,
        assetId,
        amount,
    });

    expect(assetId).toBeDefined();
    expect(unsubscriber).toBeDefined();
});

test("Mint amount", () => {
    const result = mintAmount(3, 4);
    expect(result.toString()).toBe("30000");
});

test("Creation of new asset but not able to find unused ID", async () => {
    const api = new ApiPromise();
    api.assetQueriesBeforeNone = 1000;

    const callback = jest.fn();
    const errorCallback = jest.fn();

    return expect(createAsset({
        api,
        signerId: "signerId",
        callback,
        errorCallback,
    })).rejects.toThrow();
});
