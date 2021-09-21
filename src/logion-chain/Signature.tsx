import { web3FromAddress } from '@polkadot/extension-dapp';
import { ISubmittableResult } from '@polkadot/types/types';
import { SubmittableExtrinsic } from '@polkadot/api/submittable/types';
import { toHex } from './Codec';
import { Hash } from 'fast-sha256';
import { base64Encode } from '@polkadot/util-crypto';
import { Moment } from 'moment';

import { toIsoString } from './datetime';

export type SignedTransaction = ISubmittableResult;

export type SignAndSendCallback = (result: SignedTransaction) => void;

export type Unsubscriber = Promise<() => void>;

export type ErrorCallback = (error: any) => void;

export interface ExtrinsicSubmissionParameters {
    signerId: string,
    callback: SignAndSendCallback,
    errorCallback: ErrorCallback
}

export interface ExtrinsicSignatureParameters extends ExtrinsicSubmissionParameters {
    submittable: SubmittableExtrinsic<'promise'>,
}

export function signAndSend(parameters: ExtrinsicSignatureParameters): Unsubscriber {
    const unsubscriber = web3FromAddress(parameters.signerId)
        .then(extension => parameters.submittable.signAndSend(parameters.signerId, {
            signer: extension.signer
        }, parameters.callback));
    unsubscriber.catch(parameters.errorCallback);
    return unsubscriber;
}

export async function replaceUnsubscriber(
        currentUnsubscriber: Unsubscriber | null,
        setUnsubscriber: (newUnsubscriber: Unsubscriber | null) => void,
        newUnsubscriber: Unsubscriber | null): Promise<void> {
    try {
        await unsubscribe(currentUnsubscriber);
    } catch(e) {
        // Should have been already handled by callback
    }
    setUnsubscriber(newUnsubscriber);
}

export async function unsubscribe(unsubscriber: Unsubscriber | null): Promise<void> {
    if(unsubscriber !== null) {
        try {
            const callable = await unsubscriber;
            callable();
        } catch(e) {
            console.log("Could not unsubscribe: " + e);
        }
    }
}

export interface AttributesSignatureParameters {
    signerId: string,
    resource: string,
    operation: string,
    signedOn: Moment,
    attributes: any[],
}

export async function sign(parameters: AttributesSignatureParameters): Promise<string> {
    const extension = await web3FromAddress(parameters.signerId);
    let signedOn = toIsoString(parameters.signedOn);
    const attributes = [parameters.resource, parameters.operation, signedOn];
    const allAttributes = attributes.concat(parameters.attributes);
    const result = await extension.signer.signRaw!({
        address: parameters.signerId,
        type: "bytes",
        data: toHex(createHash(allAttributes))
    });
    return result.signature;
}

export function createHash(attributes: any[]): string {
    let digest = new Hash();
    for (let i = 0; i < attributes.length; i++) {
        const bytes = new TextEncoder().encode(attributes[i]);
        digest.update(bytes);
    }
    return base64Encode(digest.digest());
}

export function isFinalized(status: ISubmittableResult | null) {
    return status !== null && status.isFinalized;
}
