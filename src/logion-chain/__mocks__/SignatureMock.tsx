export let signAndSend = (parameters: any) => 42;

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
    
}
