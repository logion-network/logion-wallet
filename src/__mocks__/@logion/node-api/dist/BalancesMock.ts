
export let getBalances = jest.fn();

export function setGetBalances(func: any) {
    getBalances = func
}

export function buildTransferCall() {
    return {};
}
