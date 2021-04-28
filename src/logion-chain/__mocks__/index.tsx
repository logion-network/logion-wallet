import { Extension } from '../Keys';

const LogionChainContextProvider = (props: any) => null;

let context = {
    apiState: 'CONNECT_INIT',
    injectedAccounts: []
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
