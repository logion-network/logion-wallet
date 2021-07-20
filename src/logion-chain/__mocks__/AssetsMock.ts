export let accountBalance = jest.fn();

export function setAccountBalance(func: any) {
    accountBalance = func;
}
