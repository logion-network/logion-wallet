import React, { useCallback, useState } from 'react';

import { useLogionChain } from '../../logion-chain';
import { createRecovery, claimRecovery } from '../../logion-chain/Recovery';
import ExtrinsicSubmitter, { SignAndSubmit } from '../../ExtrinsicSubmitter';

import { ProtectionRequest, ProtectionRequestStatus } from "../../common/types/ModelTypes";
import { LegalOfficer, legalOfficerByAddress, legalOfficers } from '../../common/types/LegalOfficer';
import { FullWidthPane } from "../../common/Dashboard";
import Frame from "../../common/Frame";
import Alert from '../../common/Alert';
import Button from '../../common/Button';
import Icon from '../../common/Icon';
import { GREEN } from '../../common/ColorTheme';
import { useCommonContext } from '../../common/CommonContext';

import { useUserContext } from '../UserContext';

import LegalOfficers from './LegalOfficers';
import './ProtectionRecoveryRequest.css';
import NetworkWarning from '../../common/NetworkWarning';
import { SETTINGS_PATH } from '../UserRouter';

export type ProtectionRecoveryRequestStatus = 'pending' | 'accepted' | 'activated';

export interface Props {
    requests: ProtectionRequest[],
    type: ProtectionRecoveryRequestStatus,
}

export default function ProtectionRecoveryRequest(props: Props) {
    const { api } = useLogionChain();
    const { accounts, colorTheme, nodesDown } = useCommonContext();
    const { refreshRequests, recoveryConfig, recoveredAddress } = useUserContext();
    const [ signAndSubmit, setSignAndSubmit ] = useState<SignAndSubmit>(null);
    const [ signAndSubmitClaim, setSignAndSubmitClaim ] = useState<SignAndSubmit>(null);

    const activateProtection = useCallback(() => {
        const signAndSubmit: SignAndSubmit = (setResult, setError) => createRecovery({
            api: api!,
            signerId: accounts!.current!.address,
            legalOfficers: props.requests.map(request => request.legalOfficerAddress),
            callback: setResult,
            errorCallback: setError
        });
        setSignAndSubmit(() => signAndSubmit);
    }, [ api, accounts, props, setSignAndSubmit ]);

    const doClaimRecovery = useCallback(() => {
        const signAndSubmit: SignAndSubmit = (setResult, setError) => claimRecovery({
            api: api!,
            signerId: accounts!.current!.address,
            callback: setResult,
            errorCallback: setError,
            addressToRecover: props.requests[0].addressToRecover!,
        });
        setSignAndSubmitClaim(() => signAndSubmit);
    }, [ api, accounts, props, setSignAndSubmitClaim ]);

    if(recoveryConfig === null || recoveredAddress === undefined) {
        return null;
    }

    const isRecovery = recoveredAddress !== null || props.requests.find(request => request.isRecovery) !== undefined;

    if(props.requests.length >= 2) {
        const request = props.requests[0];

        const legalOfficer1: LegalOfficer = legalOfficerByAddress(props.requests[0].legalOfficerAddress);
        const legalOfficer2: LegalOfficer = legalOfficerByAddress(props.requests[1].legalOfficerAddress);
        let legalOfficer1Status: ProtectionRequestStatus;
        let legalOfficer2Status: ProtectionRequestStatus;
        if(props.type === 'pending') {
            legalOfficer1Status = props.requests[0].status;
            legalOfficer2Status = props.requests[1].status;
        } else if(props.type === 'accepted') {
            legalOfficer1Status = 'ACCEPTED';
            legalOfficer2Status = 'ACCEPTED';
        } else {
            legalOfficer1Status = 'ACTIVATED';
            legalOfficer2Status = 'ACTIVATED';
        }

        const forAccount = request.addressToRecover !== null ? ` for account ${request.addressToRecover}` : "";

        const mainTitle = isRecovery && request.status !== 'ACTIVATED' ? "Recovery" : "My Logion Protection";
        let subTitle;
        let alert = null;
        if(props.type === 'pending') {
            subTitle = isRecovery ? "Recovery process status" : undefined;
            if(isRecovery) {
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
            if(isRecovery) {
                subTitle = "My recovery request";
                alert = (
                    <Alert variant="info">
                        Your recovery request has been accepted by your Legal Officers.
                        You may now activate your protection. This will require 2 signatures.
                        After that, you'll be able to initiate the actual recovery.
                    </Alert>
                );
            } else {
                subTitle = "My Logion protection request";
                alert = (
                    <Alert variant="info">
                        Your Logion Trust Protection request has been accepted by your
                        Legal Officers. You may now activate your protection.
                    </Alert>
                );
            }
        } else if(props.type === 'activated') {
            if(isRecovery) {
                if(recoveredAddress === null) {
                    alert = (
                        <Alert variant="info">
                            You are now ready to claim the access to address { request.addressToRecover }.
                        </Alert>
                    );
                }
            }
        }

        return (
            <FullWidthPane
                mainTitle={ mainTitle }
                subTitle={ subTitle }
                titleIcon={{
                    icon: {
                        id: isRecovery && request.status !== 'ACTIVATED' ? 'recovery' : 'shield',
                        hasVariants: isRecovery && request.status !== 'ACTIVATED' ? false : true,
                    },
                    background: isRecovery && request.status !== 'ACTIVATED' ? colorTheme.recoveryItems.iconGradient : undefined,
                }}
            >
                    {
                        nodesDown.length > 0 &&
                        <NetworkWarning settingsPath={ SETTINGS_PATH } />
                    }
                    <Frame className="ProtectionRecoveryRequest">
                        { alert }

                        {
                            props.type === 'activated' && (!isRecovery || recoveredAddress !== null) && 
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

                        {
                            props.type === 'accepted' && recoveryConfig?.isEmpty && signAndSubmit === null &&
                            <Button
                                data-testid="btnActivate"
                                onClick={ activateProtection }
                            >
                                Activate
                            </Button>
                        }
                        <ExtrinsicSubmitter
                            id="activatedProtection"
                            successMessage="Protection successfully activated."
                            signAndSubmit={ signAndSubmit }
                            onSuccess={ () => {
                                setSignAndSubmit(null);
                                refreshRequests!(true);
                            }}
                            onError={ () => {} }
                        />
                        {
                            props.type === 'activated' && isRecovery && recoveredAddress === null && signAndSubmitClaim === null &&
                            <Button
                                data-testid="btnClaim"
                                onClick={ doClaimRecovery }
                            >
                                Claim
                            </Button>
                        }
                        {
                            props.type === 'activated' && isRecovery && recoveredAddress === null &&
                            <ExtrinsicSubmitter
                                id="initiateRecovery"
                                successMessage="Recovery successfully initiated."
                                signAndSubmit={ signAndSubmitClaim }
                                onSuccess={ () => { setSignAndSubmitClaim(null); refreshRequests!(true); } }
                                onError={ () => {} }
                            />
                        }

                        <LegalOfficers
                            legalOfficers={ legalOfficers(nodesDown) }
                            legalOfficer1={ legalOfficer1 }
                            setLegalOfficer1={ () => {} }
                            legalOfficer1Status={ legalOfficer1Status }
                            legalOfficer2={ legalOfficer2 }
                            setLegalOfficer2={ () => {} }
                            legalOfficer2Status={ legalOfficer2Status }
                            mode="view"
                        />
                    </Frame>
            </FullWidthPane>
        );
    } else {
        const mainTitle = isRecovery ? "Recovery" : "My Logion Protection";

        return (
            <FullWidthPane
                mainTitle={ mainTitle }
                titleIcon={{
                    icon: {
                        id: isRecovery ? 'recovery' : 'shield',
                        hasVariants: isRecovery ? false : true,
                    },
                    background: isRecovery ? colorTheme.recoveryItems.iconGradient : undefined,
                }}
            >
                    {
                        nodesDown.length > 0 &&
                        <NetworkWarning settingsPath={ SETTINGS_PATH } />
                    }
                    <Frame className="ProtectionRecoveryRequest network-warning">

                        {
                            props.type === 'activated' &&
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
