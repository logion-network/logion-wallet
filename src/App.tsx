import React from 'react';
import { LogionChainContextProvider } from './logion-chain';

import Main from './Main';

export default function App() {
    return (
        <LogionChainContextProvider>
            <Main/>
        </LogionChainContextProvider>
    );
}
