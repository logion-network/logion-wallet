import React from 'react';
import { LogionChainContextProvider } from './logion-chain';

import config from './config';

import Main from './Main';

export default function App() {
    return (
        <LogionChainContextProvider config={config}>
            <Main/>
        </LogionChainContextProvider>
    );
}
