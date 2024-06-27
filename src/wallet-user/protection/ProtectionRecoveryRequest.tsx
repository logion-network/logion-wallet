import { UnavailableProtection } from "@logion/client";

import { useLogionChain } from '../../logion-chain';

import { FullWidthPane } from "../../common/Dashboard";
import Frame from "../../common/Frame";
import Icon from '../../common/Icon';
import { GREEN } from '../../common/ColorTheme';
import { useCommonContext } from '../../common/CommonContext';
import NetworkWarning from '../../common/NetworkWarning';

import { useUserContext } from '../UserContext';
import { SETTINGS_PATH } from '../UserPaths';

import AccountProtectionFrame, { ProtectionRecoveryRequestStatus } from './AccountProtectionFrame';

import './ProtectionRecoveryRequest.css';

export interface Props {
    type: ProtectionRecoveryRequestStatus,
}

export type Refusal = 'single' | 'double' | 'none';

export default function ProtectionRecoveryRequest(props: Props) {
    const { getOfficer } = useLogionChain();
    const { colorTheme, availableLegalOfficers, nodesDown } = useCommonContext();
    const { protectionState } = useUserContext();

    if(protectionState === undefined || availableLegalOfficers === undefined || getOfficer === undefined) {
        return null;
    }

    if(props.type !== 'unavailable') {
        const protectionParameters = protectionState.protectionParameters;

        const mainTitle = protectionParameters.isRecovery && !protectionParameters.isClaimed ? "Recovery" : "My Logion Protection";
        let subTitle;
        if(props.type === 'pending') {
            subTitle = protectionParameters.isRecovery ? "Recovery process status" : undefined;
            if(protectionParameters.isRecovery) {
                subTitle = "Recovery process status";
            }
        } else if(props.type === 'accepted') {
            if(protectionParameters.isRecovery) {
                subTitle = "My recovery request";
            } else {
                subTitle = "My Logion protection request";
            }
        }

        return (
            <FullWidthPane
                mainTitle={ mainTitle }
                subTitle={ subTitle }
                titleIcon={{
                    icon: {
                        id: protectionParameters.isRecovery && !protectionParameters.isClaimed ? 'recovery' : 'shield',
                        hasVariants: protectionParameters.isRecovery && !protectionParameters.isClaimed ? false : true,
                    },
                    background: protectionParameters.isRecovery && !protectionParameters.isClaimed ? colorTheme.recoveryItems.iconGradient : undefined,
                }}
            >
                    {
                        nodesDown.length > 0 &&
                        <NetworkWarning settingsPath={ SETTINGS_PATH } />
                    }
                    <AccountProtectionFrame type={ props.type } />
            </FullWidthPane>
        );
    } else {
        const unavailableProtection = protectionState as UnavailableProtection;
        const mainTitle = unavailableProtection.isRecovery ? "Recovery" : "My Logion Protection";

        return (
            <FullWidthPane
                mainTitle={ mainTitle }
                titleIcon={{
                    icon: {
                        id: unavailableProtection.isRecovery ? 'recovery' : 'shield',
                        hasVariants: unavailableProtection.isRecovery ? false : true,
                    },
                    background: unavailableProtection.isRecovery ? colorTheme.recoveryItems.iconGradient : undefined,
                }}
            >
                    {
                        nodesDown.length > 0 &&
                        <NetworkWarning settingsPath={ SETTINGS_PATH } />
                    }
                    <Frame className="ProtectionRecoveryRequest network-warning">

                        {
                            unavailableProtection.isActivated &&
                            <div
                                className="alert-activated"
                                style={{
                                    color: GREEN,
                                    borderColor: GREEN,
                                }}
                            >
                                <Icon
                                    icon={{id: 'activated'}}
                                /> Your Logion Trust Protection is active
                            </div>
                        }
                        <p>The node of one of your legal officers is down. Please come back later in order to proceed.</p>
                    </Frame>
            </FullWidthPane>
        );
    }
}
