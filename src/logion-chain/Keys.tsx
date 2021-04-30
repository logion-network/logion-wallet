import { web3AccountsSubscribe, web3Enable, isWeb3Injected } from '@polkadot/extension-dapp';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { detect } from 'detect-browser';

export function isExtensionAvailable(): boolean {
    return isWeb3Injected;
}

type Browser = 'chrome' | 'firefox';

const availableExtensions: Record<Browser, string> = {
  chrome: 'https://chrome.google.com/webstore/detail/polkadot%7Bjs%7D-extension/mopnmbcafieddcagagdcbnhejhlodfdd',
  firefox: 'https://addons.mozilla.org/en-US/firefox/addon/polkadot-js-extension/'
};

export interface Extension {
    browser: Browser,
    url: string
}

export function recommendedExtension(): Extension | null {
    const browserInfo = detect();
    const browserName: Browser | null = (browserInfo && (browserInfo.name as Browser)) || null;
    if(browserName === null) {
        return null;
    } else {
        return {
            browser: browserName,
            url: availableExtensions[browserName],
        };
    }
}

type InjectedAccountsConsumer = (accounts: InjectedAccountWithMeta[]) => void;

export async function enableAndConsumeInjectedAccounts(appName: string, callback: InjectedAccountsConsumer): Promise<void> {
    await web3Enable(appName);
    await web3AccountsSubscribe(callback);
}
