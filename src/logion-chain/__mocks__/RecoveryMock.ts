import { signAndSend } from "./SignatureMock";

export let createRecovery = jest.fn().mockResolvedValue(() => {});
export let vouchRecovery = jest.fn().mockResolvedValue(() => {});

export let getRecoveryConfig = () => (Promise.resolve({
    isEmpty: false
}));

export function setActiveRecoveryInProgress(value: boolean) {
    _activeRecovery = value;
}

let _activeRecovery = false;

export let getActiveRecovery = () => (Promise.resolve({
    isSome: _activeRecovery,
    isEmpty: !_activeRecovery
}));

export let initiateRecovery = (parameters: any) => signAndSend(parameters);
