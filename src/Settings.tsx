import { VersionContextProvider } from './version/VersionContext';
import SettingsPane from './SettingsPane';

export default function Settings() {

    return (
        <VersionContextProvider>
            <SettingsPane />
        </VersionContextProvider>
    );
}
