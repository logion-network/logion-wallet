import { LogionChainContextProvider } from './logion-chain';
import { VersionContextProvider } from './version/VersionContext';

import Main from './Main';

export default function App() {
    return (
        <LogionChainContextProvider>
            <VersionContextProvider>
                <Main/>
            </VersionContextProvider>
        </LogionChainContextProvider>
    );
}
