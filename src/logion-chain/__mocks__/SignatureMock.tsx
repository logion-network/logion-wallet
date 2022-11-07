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

export function mockSubmittableResult(isFinalized: boolean, statusType?: string, isError?: boolean): ISubmittableResult {
    const result: unknown = {
        isFinalized,
        status: {
            isFinalized,
            type: statusType,
            asInBlock: {
                toString: () => "some-hex"
            },
            asFinalized: {
                toString: () => "some-hex"
            },
        },
        isError,
        txIndex: 42
    };
    return result as ISubmittableResult;
}
