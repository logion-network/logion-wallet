jest.mock('@polkadot/extension-dapp');
jest.mock('@polkadot/ui-keyring');
jest.mock('@polkadot/api');
jest.mock('./Codec');

import keyring from '@polkadot/ui-keyring';
import {
    SignAndSendCallback,
    ErrorCallback,
    ExtrinsicSignatureParameters,
    signAndSend,
    Unsubscriber,
    replaceUnsubscriber,
    StringSignatureParameters,
    signString
} from './Signature';
import { mockSubmittable, mockSigner } from '@polkadot/api';
import { setSigner } from '@polkadot/extension-dapp';

test("Injected account signs and sends successfully", async () => {
    const callback: SignAndSendCallback = () => {};
    const errorCallback: ErrorCallback = () => {};
    const submittable = mockSubmittable();
    const parameters: ExtrinsicSignatureParameters = {
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
    const parameters: ExtrinsicSignatureParameters = {
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

test("String signature", async () => {
    const signerId = "signerId";
    const message = "message";
    const expectedSignature: string = "signature";
    const signer = mockSigner(async (parameters: any): Promise<any> => {
        if(parameters.address === signerId && parameters.type === "bytes" && parameters.data === message) {
            return {
                id: "request ID",
                signature: expectedSignature,
            };
        } else {
            throw new Error("Unexpected call");
        }
    });
    setSigner(signerId, signer);
    const parameters: StringSignatureParameters = {
        signerId,
        message
    };
    const result = await signString(parameters);
    expect(result).toBe(expectedSignature);
});
