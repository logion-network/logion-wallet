export let _enabledApp: string | null = null;

export function getAccounts(appName: string, _extensions?: string[]): Promise<any[]> {
    _enabledApp = appName;
    return Promise.resolve(_accounts);
}

export function enabledApp(): string | null {
    return _enabledApp;
}

export let isWeb3Injected = true;

export function setWeb3Injected(value: boolean) {
    isWeb3Injected = value;
}

let _accounts: any[] = [];

export function updateInjectedAccounts(accounts: any[]) {
    _accounts = accounts;
}

const extensions: Record<string, any> = {
    lockedSigner: {
        signer: "lockedSigner"
    }
};

export function web3FromAddress(signerId: string): Promise<any> {
    return Promise.resolve(extensions[signerId]);
}

export function teardown() {
    _enabledApp = null;
    _accounts = [];
}

export function setSigner(signerId: string, signer: any) {
    extensions[signerId] = {
        signer
    };
}

export class ExtensionSigner {

}

export function isExtensionAvailable() {
    return true;
}

let metamaskEnabled = false;

export function enableMetaMask(appName: string) {
    return Promise.resolve(metamaskEnabled)
}

export function setMetamaskEnabled(value: boolean) {
    metamaskEnabled = value;
}

export function allMetamaskAccounts() {
    if(metamaskEnabled) {
        return Promise.resolve([{
            address: "0xa6db31d1aee06a3ad7e4e56de3775e80d2f5ea84",
        }]);
    } else {
        return Promise.resolve([]);
    }
}
