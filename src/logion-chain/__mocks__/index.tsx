const LogionChainContextProvider = (props: any) => null;

let context = {
    apiState: 'CONNECT_INIT',
    injectedAccounts: []
};

export function setContextMock(mock: any) {
    context = mock;
}

const useLogionChain = () => context;

export {
    LogionChainContextProvider,
    useLogionChain
};
