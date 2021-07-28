import { toIsoString } from '../datetime';

export let signAndSend = (parameters: any) => {
    signAndSendCallback = parameters.callback;
    return Promise.resolve(() => {});
}

let signAndSendCallback: any = null;

export function finalizeSubmission() {
    signAndSendCallback!({
        isFinalized: true,
        status: {
            type: "finalized",
            asFinalized: "finalized",
        }
    });
}

export function setSignAndSend(fn: any) {
    signAndSend = fn;
}

export function mockSubmittableResult(isFinalized: boolean, statusType?: string) {
    return {
        isFinalized,
        status: {
            type: statusType
        }
    };
}

export function unsubscribe() {
    return Promise.resolve();
}

export function replaceUnsubscriber() {

}

export function sign(parameters: any) {
    let signedOn = toIsoString(parameters.signedOn);
    const requiredAttributes = [parameters.resource, parameters.operation, signedOn];
    const attributes = requiredAttributes.concat(parameters.attributes);
    return Promise.resolve(attributes.toString());
}

export let _isFinalized = true;

export function isFinalized(result: any) {
    return _isFinalized;
}

export function setIsFinalized(value: boolean) {
    _isFinalized = value;
}
