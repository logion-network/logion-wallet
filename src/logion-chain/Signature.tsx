import { web3FromAddress } from '@polkadot/extension-dapp';
import { ISubmittableResult } from '@polkadot/types/types';
import { SubmittableExtrinsic } from '@polkadot/api/submittable/types';
import { toHex } from './Codec';

export type SignAndSendCallback = (result: ISubmittableResult) => void;

export type Unsubscriber = Promise<() => void>;

export type ErrorCallback = (error: any) => void;

export interface ExtrinsicSignatureParameters {
    signerId: string,
    submittable: SubmittableExtrinsic<'promise'>,
    callback: SignAndSendCallback,
    errorCallback: ErrorCallback
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
    setUnsubscriber: (newUnsubscriber: Unsubscriber) => void,
    newUnsubscriber: Unsubscriber): Promise<void> {
    if(currentUnsubscriber !== null) {
        const callable = await currentUnsubscriber;
        callable();
    }
    setUnsubscriber(newUnsubscriber);
}

export interface StringSignatureParameters {
    signerId: string,
    message: string,
}

export async function signString(parameters: StringSignatureParameters): Promise<string> {
    const extension = await web3FromAddress(parameters.signerId);
    const result = await extension.signer.signRaw!({
        address: parameters.signerId,
        type: "bytes",
        data: toHex(parameters.message)
    });
    return result.signature;
}
