jest.mock('@polkadot/extension-dapp');
jest.mock('detect-browser');

import { setBrowser } from '../__mocks__/DetectBrowserMock';
import { enabledApp, accountsCallback, setWeb3Injected } from '../__mocks__/PolkadotExtensionDappMock';
import { recommendedExtension, enableExtensions, isExtensionAvailable } from './Keys';

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
    const register = await enableExtensions(appName);
    register(callback);
    expect(enabledApp()).toBe(appName);
    expect(accountsCallback()).toBe(callback);
});

test("isExtensionAvailable returns isWeb3Injected", () => {
    setWeb3Injected(true);
    const result = isExtensionAvailable();
    expect(result).toBe(true);
});

test("detects none", () => {
    setBrowser(null);
    const extension = recommendedExtension();
    expect(extension).toBeNull();
});
