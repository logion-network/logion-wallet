export let _enabledApp: string | null = null;

export function web3Enable(appName: string): Promise<void> {
    _enabledApp = appName;
    return Promise.resolve();
}

export function enabledApp(): string | null {
    return _enabledApp;
}

export const isWeb3Injected = true;

let _accountsCallback: (() => void) | null = null;

export function web3AccountsSubscribe(callback: () => void): Promise<void> {
    _accountsCallback = callback;
    return Promise.resolve();
}

export function accountsCallback() {
    return _accountsCallback;
}
