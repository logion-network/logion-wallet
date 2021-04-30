jest.mock('@polkadot/extension-dapp');
jest.mock('detect-browser');

import { setBrowser } from 'detect-browser';
import { recommendedExtension, enableAndConsumeInjectedAccounts } from './Keys';
import { enabledApp, accountsCallback } from '@polkadot/extension-dapp';

test("detects Firefox", () => {
    setBrowser('firefox');
    const extension = recommendedExtension();
    expect(extension).not.toBeNull();
    expect(extension!.browser).toBe('firefox');
});

test("detects Chrome", () => {
    setBrowser('chrome');
    const extension = recommendedExtension();
    expect(extension).not.toBeNull();
    expect(extension!.browser).toBe('chrome');
});

test("enables and consumes injected accounts", async () => {
    const appName = "app";
    const callback = () => {};
    await enableAndConsumeInjectedAccounts(appName, callback);
    expect(enabledApp()).toBe(appName);
    expect(accountsCallback()).toBe(callback);
});
