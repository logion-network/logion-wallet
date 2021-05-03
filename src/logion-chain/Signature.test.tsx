jest.mock('@polkadot/extension-dapp');
jest.mock('@polkadot/ui-keyring');
jest.mock('@polkadot/api');

import keyring from '@polkadot/ui-keyring';
import {
    SignAndSendCallback,
    ErrorCallback,
    SignatureParameters,
    signAndSend,
    Unsubscriber,
    replaceUnsubscriber
} from './Signature';
import { mockSubmittable } from '@polkadot/api';

test("Injected account signs and sends successfully", async () => {
    const callback: SignAndSendCallback = () => {};
    const errorCallback: ErrorCallback = () => {};
    const submittable = mockSubmittable();
    const parameters: SignatureParameters = {
        keyring,
        signerId: "lockedSigner",
        submittable,
        callback,
        errorCallback
    };
    const unsubscriber = await signAndSend(parameters);
    expect(unsubscriber).toBe(submittable.unsubscriber);
    expect(submittable.signatureType).toBe('INJECTED');
});

test("Keyring account signs and sends successfully", async () => {
    const callback: SignAndSendCallback = () => {};
    const errorCallback: ErrorCallback = () => {};
    const submittable = mockSubmittable();
    const parameters: SignatureParameters = {
        keyring,
        signerId: "regularSigner",
        submittable,
        callback,
        errorCallback
    };
    const unsubscriber = await signAndSend(parameters);
    expect(unsubscriber).toBe(submittable.unsubscriber);
    expect(submittable.signatureType).toBe('KEYRING');
});

test("Setting new unsubscriber", () => {
    const currentUnsubscriber: Unsubscriber | null = null;
    let newUnsubscriber: Unsubscriber | null = Promise.resolve(() => {});
    let setValue: Unsubscriber | null = null;
    const setUnsubscriber = (value: Unsubscriber) => {setValue = value};
    replaceUnsubscriber(currentUnsubscriber, setUnsubscriber, newUnsubscriber);
    expect(setValue).toBe(newUnsubscriber);
});

test("Replacing existing unsubscriber", async () => {
    let currentUnsubscriberCalled: boolean = false;
    const currentUnsubscriber: Unsubscriber | null = Promise.resolve(() => {currentUnsubscriberCalled = true});
    let newUnsubscriber: Unsubscriber | null = Promise.resolve(() => {});
    let setValue: Unsubscriber | null = null;
    const setUnsubscriber = (value: Unsubscriber) => {setValue = value};
    await replaceUnsubscriber(currentUnsubscriber, setUnsubscriber, newUnsubscriber);
    expect(currentUnsubscriberCalled).toBe(true);
    expect(setValue).toBe(newUnsubscriber);
});
