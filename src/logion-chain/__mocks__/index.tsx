import { Extension } from '../Keys';

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
    return Promise.resolve(parameters.attributes.toString());
}
