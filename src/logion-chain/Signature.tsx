import { ExtensionSigner } from '@logion/extension';
import { ISubmittableResult } from '@polkadot/types/types';
import type { SubmittableExtrinsic } from '@polkadot/api/promise/types';

export type SignedTransaction = ISubmittableResult;

export type SignAndSendCallback = (result: SignedTransaction) => void;

export type ErrorCallback = (error: any) => void;

export interface ExtrinsicSignatureParameters {
    signerId: string,
    callback: SignAndSendCallback,
    errorCallback: ErrorCallback
    submittable: SubmittableExtrinsic,
}

export function signAndSend(parameters: ExtrinsicSignatureParameters) {
    const signer = new ExtensionSigner();
    signer.signAndSend({
        signerId: parameters.signerId,
        submittable: parameters.submittable,
        callback: parameters.callback,
    })
    .catch(error => parameters.errorCallback(error));
}
