const LogionChainContextProvider = (props: any) => <div className="contextMock">{props.children}</div>;

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
