import { ExtensionSigner } from '@logion/extension';
import { ISubmittableResult } from '@polkadot/types/types';
import type { SubmittableExtrinsic } from '@polkadot/api/promise/types';
import { DateTime } from 'luxon';

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
    submittable: SubmittableExtrinsic,
}

export function signAndSend(parameters: ExtrinsicSignatureParameters): Unsubscriber {
    const signer = new ExtensionSigner();
    signer.signAndSend({
        signerId: parameters.signerId,
        submittable: parameters.submittable,
        callback: parameters.callback,
    })
    .catch(error => parameters.errorCallback(error));
    return Promise.resolve(() => {});
}

export async function replaceUnsubscriber(
    _currentUnsubscriber: Unsubscriber | null,
    _setUnsubscriber: (newUnsubscriber: Unsubscriber | null) => void,
    _newUnsubscriber: Unsubscriber | null
): Promise<void> {
    // Unsubscribers are managed by ExtensionSigner
}

export async function unsubscribe(_unsubscriber: Unsubscriber | null): Promise<void> {
    // Unsubscribers are managed by ExtensionSigner
}

export interface AttributesSignatureParameters {
    signerId: string,
    resource: string,
    operation: string,
    signedOn: DateTime,
    attributes: any[],
}

export async function sign(parameters: AttributesSignatureParameters): Promise<string> {
    const signer = new ExtensionSigner();
    const typedSignature = await signer.signRaw({
        ...parameters
    });
    return typedSignature.signature
}

export function isSuccessful(status: ISubmittableResult | null) {
    return status !== null && status.isInBlock && !status.isError;
}
