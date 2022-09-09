import { VersionContextProvider } from '../version/VersionContext';
import SettingsPane from './SettingsPane';

export interface Props {
    showContactInformation: boolean;
    missingSettings: boolean;
}

export default function Settings(props: Props) {

    return (
        <VersionContextProvider>
            <SettingsPane showContactInformation={ props.showContactInformation } missingSettings={ props.missingSettings } />
        </VersionContextProvider>
    );
}
