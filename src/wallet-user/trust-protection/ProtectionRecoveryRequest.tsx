import React, { useCallback, useState } from 'react';

import { useLogionChain } from '../../logion-chain';
import { createRecovery } from '../../logion-chain/Recovery';
import ExtrinsicSubmitter, { SignAndSubmit } from '../../ExtrinsicSubmitter';

import { ProtectionRequest } from "../../legal-officer/Types";
import LegalOfficer from '../../component/types/LegalOfficer';
import { ContentPane } from "../../component/Dashboard";
import Frame from "../../component/Frame";
import Alert from '../../component/Alert';
import Button from '../../component/Button';
import Icon from '../../component/Icon';
import { GREEN } from '../../component/ColorTheme';
import { useRootContext } from '../../RootContext';

import { useUserContext } from '../UserContext';

import { legalOfficerByAddress, checkActivation } from "./Model";
import LegalOfficers from './LegalOfficers';
import './ProtectionRecoveryRequest.css';

export type ProtectionRecoveryRequestStatus = 'pending' | 'accepted' | 'activated';

export interface Props {
    request: ProtectionRequest,
    type: ProtectionRecoveryRequestStatus;
}

export default function ProtectionRecoveryRequest(props: Props) {
    const { api } = useLogionChain();
    const { selectAddress, addresses, currentAddress } = useRootContext();
    const { refreshRequests, colorTheme, recoveryConfig } = useUserContext();
    const [ confirmButtonEnabled, setConfirmButtonEnabled ] = useState(props.request.status === "PENDING");
    const [ signAndSubmit, setSignAndSubmit ] = useState<SignAndSubmit>(null);

    const activateProtection = useCallback(() => {
        const signAndSubmit: SignAndSubmit = (setResult, setError) => createRecovery({
            api: api!,
            signerId: currentAddress,
            legalOfficers: props.request.decisions.map(decision => decision.legalOfficerAddress),
            callback: setResult,
            errorCallback: setError
        });
        setSignAndSubmit(() => signAndSubmit);
    }, [ api, currentAddress, props ]);

    if(addresses === null || selectAddress === null || recoveryConfig === null) {
        return null;
    }

    const legalOfficer1: LegalOfficer = legalOfficerByAddress(props.request.decisions[0].legalOfficerAddress);
    const legalOfficer1Decision = props.request.decisions[0].status;
    const legalOfficer2: LegalOfficer = legalOfficerByAddress(props.request.decisions[1].legalOfficerAddress);
    const legalOfficer2Decision = props.request.decisions[1].status;

    const forAccount = props.request.addressToRecover !== null ? ` for account ${props.request.addressToRecover}` : "";

    const mainTitle = props.request.isRecovery ? "Recovery" : "My Logion Trust Protection";
    let subTitle;
    let alert;
    if(props.type === 'pending') {
        subTitle = props.request.isRecovery ? "Recovery process status" : undefined;
        if(props.request.isRecovery) {
            subTitle = "Recovery process status";
            alert = (
                <Alert variant="info">
                    Your Logion Recovery request
                    { forAccount } has been submitted. Your Legal Officers
                    will contact you as soon as possible to finalize the KYC process.
                </Alert>
            );
        } else {
            alert = (
                <Alert variant="info">
                    Your Logion Trust Protection request has been submitted. Your Legal Officers
                    will contact you as soon as possible to finalize the KYC process. Please note that, after the successful
                    completion of one of your Legal Officer approval processes, you will be able to use all features
                    provided by your logion account dashboard.
                </Alert>
            );
        }
    } else if(props.type === 'accepted') {
        if(props.request.isRecovery) {
            subTitle = "My recovery request";
            alert = (
                <Alert variant="info">
                    Your recovery request has been accepted by your Legal Officers.
                    You may now activate your protection. This will require 2 signatures.
                    After that, you'll be able to initiate the actual recovery.
                </Alert>
            );
        } else {
            subTitle = "My Logion Trust protection request";
            alert = (
                <Alert variant="info">
                    Your Logion Trust Protection request has been accepted by your
                    Legal Officers. You may now activate your protection. This will require 2 signatures.
                </Alert>
            );
        }
    } else if(props.type === 'activated') {
        if(confirmButtonEnabled) {
            alert = (
                <Alert variant="warning">
                    Mandatory: we detect that the Logion Application needs to be re-synchronized with the Logion
                    Blockchain. To proceed, please click on the button and sign to confirm this operation.
                </Alert>
            );
        } else if(props.request.isRecovery) {
            alert = (
                <Alert variant="info">
                    You are now ready to initiate the actual recovery of address { props.request.addressToRecover }.
                </Alert>
            );
        } else {
            alert = null;
        }
    } else {
        alert = null;
    }

    return (
        <ContentPane
            mainTitle={ mainTitle }
            subTitle={ subTitle }
            titleIcon={{
                icon: {
                    id: props.request.isRecovery ? 'recovery' : 'shield',
                    hasVariants: props.request.isRecovery ? false : true,
                },
                background: props.request.isRecovery ? colorTheme.bottomMenuItems.iconGradient : undefined,
            }}
            colors={ colorTheme }
            addresses={ addresses }
            selectAddress={ selectAddress }
            primaryPaneWidth={ 8 }
            primaryAreaChildren={
                <Frame
                    className="ProtectionRecoveryRequest"
                    colors={ colorTheme }
                >
                    { alert }

                    {
                        props.type === 'activated' && !confirmButtonEnabled && !props.request.isRecovery &&
                        <div
                            className="alert-activated"
                            style={{
                                color: GREEN,
                                borderColor: GREEN,
                            }}
                        >
                            <Icon colorThemeType={ colorTheme.type } icon={{id: 'accepted'}} /> Your Logion Trust Protection is active
                        </div>
                    }

                    {
                        props.type === 'accepted' && recoveryConfig?.isEmpty && signAndSubmit === null &&
                        <Button
                            data-testid="btnActivate"
                            onClick={ activateProtection }
                            colors={ colorTheme.buttons }
                        >
                            Activate
                        </Button>
                    }
                    {
                        // This button is a safety net in case the same call at the previous step failed.
                        // In most cases, it will not show
                        props.type === 'activated' && confirmButtonEnabled &&
                        <Button
                            id="btnConfirmProtection"
                            onClick={() => {
                            checkActivation(props.request)
                                .then(() => setConfirmButtonEnabled(false))
                            }}
                            colors={ colorTheme.buttons }
                        >
                            Re-Sync Confirmation
                        </Button>
                    }
                    <ExtrinsicSubmitter
                        id="activatedProtection"
                        successMessage="Protection successfully activated."
                        signAndSubmit={ signAndSubmit }
                        onSuccess={ () => { setSignAndSubmit(null); checkActivation(props.request).finally(() => refreshRequests!(true)); } }
                        onError={ () => setSignAndSubmit(null) }
                    />

                    <LegalOfficers
                        legalOfficers={ [] }
                        legalOfficer1={ legalOfficer1 }
                        setLegalOfficer1={ () => {} }
                        legalOfficer1Decision={ legalOfficer1Decision }
                        legalOfficer2={ legalOfficer2 }
                        setLegalOfficer2={ () => {} }
                        legalOfficer2Decision={ legalOfficer2Decision }
                        colorTheme={ colorTheme }
                        mode="view"
                    />
                </Frame>
            }
            secondaryAreaChildren={ null }
        />
    );
}
