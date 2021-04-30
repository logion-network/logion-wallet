jest.mock('@polkadot/extension-dapp');
jest.mock('@polkadot/ui-keyring');
jest.mock('@polkadot/api');

import keyring from '@polkadot/ui-keyring';
import { SignAndSendCallback, ErrorCallback, SignatureParameters, signAndSend } from './Signature';
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
