import { signAndSend } from './SignatureMock';

export const DEFAULT_ASSETS_DECIMALS = 18;

export let accountBalance = jest.fn();

export function setAccountBalance(func: any) {
    accountBalance = func;
}

export function createAsset(parameters: any) {
    signAndSend(parameters);
    return Promise.resolve({
        assetId: "assetId",
        unsubscriber: Promise.resolve(() => {})
    });
}

export function setAssetMetadata(parameters: any) {
    signAndSend(parameters);
    return Promise.resolve(() => {});
}

export function balanceFromAmount(tokens: any) {
    return tokens;
}

export function mintTokens(parameters: any) {
    signAndSend(parameters);
    return Promise.resolve(() => {});
}

export function buildTransferCall() {
    return {};
}
