export let createRecovery = jest.fn().mockResolvedValue(() => {});
export let vouchRecovery = jest.fn().mockResolvedValue(() => {});

export let getRecoveryConfig = () => (Promise.resolve({
    legalOfficers: [""]
}));

export function setActiveRecoveryInProgress(value: boolean) {
    _activeRecovery = value;
}

let _activeRecovery = false;

export let getActiveRecovery = () => (Promise.resolve(
    _activeRecovery ?
        { legalOfficers: [ "" ] } :
        undefined
));

export let initiateRecovery = (parameters: any) => {};

export let asRecovered = (parameters: any) => {};
