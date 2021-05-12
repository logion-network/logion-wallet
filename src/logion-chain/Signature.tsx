import { web3FromAddress } from '@polkadot/extension-dapp';
import { Keyring } from '@polkadot/ui-keyring';
import { ISubmittableResult } from '@polkadot/types/types';
import { Signer } from '@polkadot/api/types';
import { SubmittableExtrinsic } from '@polkadot/api/submittable/types';

export type SignAndSendCallback = (result: ISubmittableResult) => void;

export type Unsubscriber = Promise<() => void>;

export type ErrorCallback = (error: any) => void;

export interface ExtrinsicSignatureParameters {
    keyring: Keyring,
    signerId: string,
    submittable: SubmittableExtrinsic<'promise'>,
    callback: SignAndSendCallback,
    errorCallback: ErrorCallback
}

export function signAndSend(parameters: ExtrinsicSignatureParameters): Unsubscriber {
    const signer = parameters.keyring.getPair(parameters.signerId);
    let unsubscriber: Unsubscriber;
    if(signer.isLocked) {
        unsubscriber = web3FromAddress(parameters.signerId)
            .then(extension => parameters.submittable.signAndSend(parameters.signerId, {signer: extension.signer}, parameters.callback));
    } else {
        unsubscriber = parameters.submittable.signAndSend(signer, parameters.callback);
    }
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
    signer: Signer,
    signerId: string,
    message: string
}

export async function signString(parameters: StringSignatureParameters): Promise<string> {
    const result = await parameters.signer.signRaw!({
        address: parameters.signerId,
        type: "bytes",
        data: parameters.message
    });
    return result.signature;
}
