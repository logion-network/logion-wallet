jest.mock('@polkadot/extension-dapp');
jest.mock('@polkadot/ui-keyring');
jest.mock('@polkadot/api');
jest.mock('./Codec');

import { ISubmittableResult } from '@polkadot/types/types';
import {
    createHash,
    SignAndSendCallback,
    ErrorCallback,
    ExtrinsicSignatureParameters,
    signAndSend,
    Unsubscriber,
    replaceUnsubscriber,
    AttributesSignatureParameters,
    sign,
    isSuccessful
} from './Signature';
import { mockSubmittableResult } from './__mocks__/SignatureMock';
import { mockSubmittable, mockSigner } from '../__mocks__/PolkadotApiMock';
import { setSigner } from '../__mocks__/PolkadotExtensionDappMock';
import moment from 'moment';

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

test("Setting new unsubscriber", async () => {
    const currentUnsubscriber: Unsubscriber | null = null;
    let newUnsubscriber: Unsubscriber | null = Promise.resolve(() => {});
    let setValue: Unsubscriber | null = null;
    const setUnsubscriber = (value: Unsubscriber | null) => {setValue = value};
    await replaceUnsubscriber(currentUnsubscriber, setUnsubscriber, newUnsubscriber);
    expect(setValue).toBe(newUnsubscriber);
});

test("Replacing existing unsubscriber", async () => {
    let currentUnsubscriberCalled: boolean = false;
    const currentUnsubscriber: Unsubscriber | null = Promise.resolve(() => {currentUnsubscriberCalled = true});
    let newUnsubscriber: Unsubscriber | null = Promise.resolve(() => {});
    let setValue: Unsubscriber | null = null;
    const setUnsubscriber = (value: Unsubscriber | null) => {setValue = value};
    await replaceUnsubscriber(currentUnsubscriber, setUnsubscriber, newUnsubscriber);
    expect(currentUnsubscriberCalled).toBe(true);
    expect(setValue).toBe(newUnsubscriber);
});

test("String signature", async () => {
    const signerId = "signerId";
    const attributes: any[] = ["message", 132, true];
    const expectedSignature: string = "signature";
    const resource = "resource";
    const operation = "op";
    const signedOnString = '2021-06-01T08:24:30.573';
    const signedOn = moment(signedOnString + 'Z');
    const allAttributes = [resource, operation, signedOnString].concat(attributes);
    const expectedData = createHash(allAttributes);
    const signer = mockSigner(async (parameters: any): Promise<any> => {
        if(parameters.address === signerId
                && parameters.type === "bytes"
                && parameters.data === expectedData) {
            return {
                id: "request ID",
                signature: expectedSignature,
            };
        } else {
            const parametersJson = JSON.stringify(parameters);
            const expectedJson = JSON.stringify({
                address: signerId,
                type: "bytes",
                data: expectedData
            });
            throw new Error(`expected ${expectedJson} but got ${parametersJson}`);
        }
    });
    setSigner(signerId, signer);
    const parameters: AttributesSignatureParameters = {
        resource: "resource",
        operation: "op",
        signedOn,
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

test("isFinalized with null", () => {
    const result = isSuccessful(null);
    expect(result).toBe(false);
});

test("isFinalized with non-finalized result", () => {
    const result = isSuccessful(mockSubmittableResult(false));
    expect(result).toBe(false);
});

test("isFinalized with finalized result", () => {
    const result = isSuccessful(mockSubmittableResult(true));
    expect(result).toBe(true);
});
