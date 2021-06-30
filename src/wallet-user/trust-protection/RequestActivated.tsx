import React, { useState } from 'react';

import {FullWidthPane} from "../../component/Dashboard";
import Frame from "../../component/Frame";
import { ProtectionRequest } from "../../legal-officer/Types";
import LegalOfficerInfo from "../../component/LegalOfficerInfo";
import {useRootContext} from "../../RootContext";

import { useUserContext } from '../UserContext';
import { legalOfficerByAddress, checkActivation } from "./Model";
import { Button } from "react-bootstrap";

export interface Props {
    request: ProtectionRequest,
}

export default function RequestActivated(props: Props) {
    const { selectAddress, addresses } = useRootContext();
    const { colorTheme } = useUserContext();
    const [ confirmButtonEnabled, setConfirmButtonEnabled ] = useState(props.request.status === "PENDING");

    if(addresses === null || selectAddress === null) {
        return null;
    }

    return (
        <FullWidthPane
            colors={ colorTheme }
            addresses={ addresses }
            selectAddress={ selectAddress }
        >
            <h1>My Logion Trust Protection</h1>
            <Frame
                colors={ colorTheme }
            >
            <h2>My Legal Officers</h2>
            <p>
                Your Logion Trust Protection is active. You are now protected by
            </p>
            <ul>
                {
                    props.request.decisions
                        .map(decision => {
                            const legalOfficer = legalOfficerByAddress(decision.legalOfficerAddress);
                            return (
                                <li key={legalOfficer.address}>
                                    <LegalOfficerInfo legalOfficer={legalOfficer}/>
                                </li>
                            );
                        })
                }
            </ul>
            {
                props.request.isRecovery &&
                <p>
                    You may initiate the actual recovery of account {props.request.addressToRecover}.
                </p>
            }
            {
                // This button is a safety net in case the same call at the previous step failed.
                // In most cases, it will not show
                confirmButtonEnabled &&
                <>
                    <p>Mandatory: we detect that the Logion Application needs to be re-synchronized with the Logion
                        Blockchain. To proceed, please click on the button and sign to confirm this operation:</p>
                    <Button id="btnConfirmProtection" onClick={() => {
                        checkActivation(props.request)
                            .then(() => setConfirmButtonEnabled(false))
                    }}>
                        Re-Sync Confirmation
                    </Button>
                </>
            }
            </Frame>
        </FullWidthPane>
    );
}
