
export let getBalances = jest.fn();

export function setGetBalances(func: any) {
    getBalances = func
}
