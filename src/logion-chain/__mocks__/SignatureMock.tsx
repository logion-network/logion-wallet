import { ISubmittableResult } from '@polkadot/types/types';

export let signAndSend = (parameters: any) => {
    signAndSendCallback = parameters.callback;
    signAndSendErrorCallback = parameters.errorCallback;
    return Promise.resolve(() => {});
}

let signAndSendCallback: any = null;
let signAndSendErrorCallback: any = null;

export function submitting(): boolean {
    return signAndSendCallback !== null;
}

export function resetSubmitting() {
    signAndSendCallback = null;
    signAndSendErrorCallback = null;
}

export function finalizeSubmission() {
    signAndSendCallback!(mockSubmittableResult(true, "finalized"));
}

export function failSubmission() {
    signAndSendErrorCallback!(new Error());
}

export function setSignAndSend(fn: any) {
    signAndSend = fn;
}

export function mockSubmittableResult(isInBlock: boolean, statusType?: string, isError?: boolean): ISubmittableResult {
    const result: unknown = {
        isInBlock,
        status: {
            type: statusType,
            asInBlock: {
                toString: () => "some-hex"
            },
        },
        isError,
        txIndex: 42
    };
    return result as ISubmittableResult;
}

export function unsubscribe() {
    return Promise.resolve();
}

export function replaceUnsubscriber() {

}

export let _isSuccessful: boolean | undefined = undefined;

export function isSuccessful(result: any) {
    if(_isSuccessful === undefined) {
        return result !== null && result.isInBlock;
    } else {
        return _isSuccessful;
    }
}

export function setIsSuccessful(value: boolean) {
    _isSuccessful = value;
}
