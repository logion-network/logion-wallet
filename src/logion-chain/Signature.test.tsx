jest.mock('@polkadot/extension-dapp');
jest.mock('@polkadot/ui-keyring');
jest.mock('@polkadot/api');
jest.mock('./Codec');

import {
    createHash,
    SignAndSendCallback,
    ErrorCallback,
    ExtrinsicSignatureParameters,
    signAndSend,
    Unsubscriber,
    replaceUnsubscriber,
    AttributesSignatureParameters,
    sign
} from './Signature';
import { mockSubmittable, mockSigner } from '@polkadot/api';
import { setSigner } from '@polkadot/extension-dapp';

test("Injected account signs and sends successfully", async () => {
    const callback: SignAndSendCallback = () => {};
    const errorCallback: ErrorCallback = () => {};
    const submittable = mockSubmittable();
    const parameters: ExtrinsicSignatureParameters = {
        signerId: "lockedSigner",
        submittable,
        callback,
        errorCallback
    };
    const unsubscriber = await signAndSend(parameters);
    expect(unsubscriber).toBe(submittable.unsubscriber);
    expect(submittable.signatureType).toBe('INJECTED');
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
    const attributes = ["message", 132, true];
    const expectedSignature: string = "signature";
    const signer = mockSigner(async (parameters: any): Promise<any> => {
        if(parameters.address === signerId && parameters.type === "bytes" && parameters.data === createHash(attributes)) {
            return {
                id: "request ID",
                signature: expectedSignature,
            };
        } else {
            throw new Error("Unexpected call");
        }
    });
    setSigner(signerId, signer);
    const parameters: AttributesSignatureParameters = {
        signerId,
        attributes
    };
    const result = await sign(parameters);
    expect(result).toBe(expectedSignature);
});

test.each(
    [
        ["iNQmb9TmM40TuEX88olXnSCciXgjuSF9o+Fhk28DFYk=", ["abcd"]],
        ["d6wxm/4ZeeLXmdnmmH5l/rVPYVEcA1UuuumQgmwghZA=", [1.2]],
        ["s6jg4fmrG/46NvIx9nb3i7MKUZ0rIebFMMDu6Ou0pdA=", [456]],
        ["L1IAt8dg2CXiUjCoVZ3wf4uIJWocNgsmhmswXmH0oAU=", ["ABC", 123, true]],
    ])(
    'createHash() %p is the hash of %p',
    (expectedMessage, attributes) => {
        const result = createHash(attributes);
        expect(result).toBe(expectedMessage);
    }
);
