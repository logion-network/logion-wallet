import { LogionChainContextProvider } from './logion-chain';
import { VersionContextProvider } from './version/VersionContext';

import Main from './Main';
import { ResponsiveProvider } from './common/Responsive';

export default function App() {
    return (
        <ResponsiveProvider>
            <LogionChainContextProvider>
                <VersionContextProvider>
                    <Main />
                </VersionContextProvider>
            </LogionChainContextProvider>
        </ResponsiveProvider>
    );
}
