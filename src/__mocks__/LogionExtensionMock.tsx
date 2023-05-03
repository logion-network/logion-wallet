export let _enabledApp: string | null = null;

export function enableExtensions(appName: string, callback: (accounts: any[]) => void): Promise<(consumer: (accounts: any[]) => void) => void> {
    _enabledApp = appName;
    _accountsCallback = callback;
    return Promise.resolve(web3AccountsSubscribe);
}

export function enabledApp(): string | null {
    return _enabledApp;
}

export let isWeb3Injected = true;

export function setWeb3Injected(value: boolean) {
    isWeb3Injected = value;
}

let _accountsCallback: ((accounts: any[]) => void) | null = null;

export function web3AccountsSubscribe(callback: (accounts: any[]) => void): Promise<void> {
    _accountsCallback = callback;
    return Promise.resolve();
}

export function accountsCallback() {
    return _accountsCallback;
}

export function updateInjectedAccounts(accounts: any[]) {
    _accountsCallback!(accounts);
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
    _accountsCallback = null;
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
