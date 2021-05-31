import { Extension } from '../Keys';
import { toIsoString } from '../datetime';

const LogionChainContextProvider = (props: any) => null;

const api = {
    tx: {
        assets: {
            create: () => {}
        }
    }
};

export let signAndSendCallback = null;

export function signAndSend(parameters: any) {
    signAndSendCallback = parameters.callback;
}

export function createAsset(parameters: any) {
    signAndSendCallback = parameters.callback;
    return Promise.resolve({
        assetId: "assetId",
        unsubscriber: Promise.resolve(() => {})
    });
}

export function setAssetMetadata(parameters: any) {
    signAndSendCallback = parameters.callback;
    return Promise.resolve(() => {});
}

export function mintAmount(tokens: any) {
    return tokens;
}

export function mintTokens(parameters: any) {
    signAndSendCallback = parameters.callback;
    return Promise.resolve(() => {});
}

export function replaceUnsubscriber() {

}

let context = {
    apiState: 'CONNECT_INIT',
    injectedAccounts: null,
    api,
};

export function setContextMock(value: any) {
    context = value;
}

export function useLogionChain() {
    return context;
}

let extensionAvailable = false;

export function setExtensionAvailable(value: boolean) {
    extensionAvailable = value;
}

export function isExtensionAvailable() {
    return extensionAvailable;
}

let recommendedExtensionValue: Extension | null = null;

export function setRecommendedExtension(value: Extension | null) {
    recommendedExtensionValue = value;
}

export function recommendedExtension(): Extension | null {
    return recommendedExtensionValue;
}

export {
    LogionChainContextProvider,
};

export function sign(parameters: any) {
    let signedOn = toIsoString(parameters.signedOn);
    const requiredAttributes = [parameters.resource, parameters.operation, signedOn];
    const attributes = requiredAttributes.concat(parameters.attributes);
    return Promise.resolve(attributes.toString());
}

export function isFinalized(result: any) {
    return true;
}

export function unsubscribe() {
    return Promise.resolve();
}

export const DEFAULT_ASSETS_DECIMALS = 18;
