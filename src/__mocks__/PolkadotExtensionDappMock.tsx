export let _enabledApp: string | null = null;

export function web3Enable(appName: string): Promise<void> {
    _enabledApp = appName;
    return Promise.resolve();
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
