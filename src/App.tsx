import { LogionChainContextProvider } from './logion-chain';
import { VersionContextProvider } from './version/VersionContext';

import Main from './Main';
import { ResponsiveProvider } from './common/Responsive';
import { DirectoryContextProvider } from './directory/DirectoryContext';

export default function App() {
    return (
        <ResponsiveProvider>
            <LogionChainContextProvider>
                <VersionContextProvider>
                    <DirectoryContextProvider>
                        <Main />
                    </DirectoryContextProvider>
                </VersionContextProvider>
            </LogionChainContextProvider>
        </ResponsiveProvider>
    );
}
