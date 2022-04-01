import { useCallback, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { createRecovery, claimRecovery } from 'logion-api/dist/Recovery';

import { useLogionChain } from '../../logion-chain';
import ExtrinsicSubmitter, { SignAndSubmit } from '../../ExtrinsicSubmitter';

import { ProtectionRequest, ProtectionRequestStatus } from "../../common/types/ModelTypes";
import { FullWidthPane } from "../../common/Dashboard";
import Frame from "../../common/Frame";
import Button from '../../common/Button';
import Icon from '../../common/Icon';
import { GREEN, ORANGE, rgbaToHex, YELLOW } from '../../common/ColorTheme';
import { useCommonContext } from '../../common/CommonContext';
import NetworkWarning from '../../common/NetworkWarning';

import { useDirectoryContext } from '../../directory/DirectoryContext';
import { LegalOfficer } from '../../directory/DirectoryApi';

import { useUserContext } from '../UserContext';
import { SETTINGS_PATH } from '../UserRouter';

import SelectLegalOfficer from './SelectLegalOfficer';

import './ProtectionRecoveryRequest.css';
import { signAndSend } from 'src/logion-chain/Signature';

export type ProtectionRecoveryRequestStatus = 'pending' | 'accepted' | 'activated';

export interface Props {
    requests: ProtectionRequest[],
    type: ProtectionRecoveryRequestStatus,
}

export default function ProtectionRecoveryRequest(props: Props) {
    const { api } = useLogionChain();
    const { accounts, colorTheme, nodesDown, availableLegalOfficers } = useCommonContext();
    const { getOfficer } = useDirectoryContext();
    const { refreshRequests, recoveryConfig, recoveredAddress } = useUserContext();
    const [ signAndSubmit, setSignAndSubmit ] = useState<SignAndSubmit>(null);
    const [ signAndSubmitClaim, setSignAndSubmitClaim ] = useState<SignAndSubmit>(null);

    const activateProtection = useCallback(() => {
        const signAndSubmit: SignAndSubmit = (setResult, setError) => signAndSend({
            signerId: accounts!.current!.address,
            callback: setResult,
            errorCallback: setError,
            submittable: createRecovery({
                api: api!,
                legalOfficers: props.requests.map(request => request.legalOfficerAddress),
            })
        });
        setSignAndSubmit(() => signAndSubmit);
    }, [ api, accounts, props, setSignAndSubmit ]);

    const doClaimRecovery = useCallback(() => {
        const signAndSubmit: SignAndSubmit = (setResult, setError) => signAndSend({
            signerId: accounts!.current!.address,
            callback: setResult,
            errorCallback: setError,
            submittable: claimRecovery({
                api: api!,
                addressToRecover: props.requests[0].addressToRecover!,
            })
        });
        setSignAndSubmitClaim(() => signAndSubmit);
    }, [ api, accounts, props, setSignAndSubmitClaim ]);

    if(recoveryConfig === null || recoveredAddress === undefined || availableLegalOfficers === undefined) {
        return null;
    }

    const isRecovery = recoveredAddress !== null || props.requests.find(request => request.isRecovery) !== undefined;

    if(props.requests.length >= 2) {
        const request = props.requests[0];

        const legalOfficer1: LegalOfficer = getOfficer(props.requests[0].legalOfficerAddress)!;
        const legalOfficer2: LegalOfficer = getOfficer(props.requests[1].legalOfficerAddress)!;
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
        let header = null;
        if(props.type === 'pending') {
            subTitle = isRecovery ? "Recovery process status" : undefined;
            if(isRecovery) {
                subTitle = "Recovery process status";
                header = (
                    <Header
                        icon="pending"
                        color={ ORANGE }
                        text={`Your Logion Recovery request ${forAccount} has been submitted. Your Legal Officers will contact you
                        as soon as possible to finalize the KYC process.`}
                    />
                );
            } else {
                header = (
                    <Header
                        icon="pending"
                        color={ ORANGE }
                        text={`Your Logion Protection request has been submitted. Your Legal Officers
                        will contact you as soon as possible to finalize the KYC process. Please note that, after the successful
                        completion of one of your Legal Officer approval processes, you will be able to use all features
                        provided by your logion account dashboard.`}
                    />
                );
            }
        } else if(props.type === 'accepted') {
            if(isRecovery) {
                subTitle = "My recovery request";
                header = (
                    <Header
                        icon="accepted"
                        color={ YELLOW }
                        text={`Your recovery request has been accepted by your Legal Officers.
                        You may now activate your protection. This will require 2 signatures.
                        After that, you'll be able to initiate the actual recovery.`}
                    />
                );
            } else {
                subTitle = "My Logion protection request";
                header = (
                    <Header
                        icon="accepted"
                        color={ YELLOW }
                        text={`Your Logion Protection request has been accepted by your
                        Legal Officers. You may now activate your protection.`}
                    />
                );
            }
        } else if(props.type === 'activated') {
            if(isRecovery && recoveredAddress === null) {
                header = (
                    <Header
                        icon="activated"
                        color={ GREEN }
                        text={`You are now ready to claim the access to address ${request.addressToRecover}.`}
                    />
                );
            } else {
                header = (
                    <Header
                        icon="activated"
                        color={ GREEN }
                        text={`Your Logion Protection is active`}
                    />
                );
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
                        { header }

                        {
                            props.type === 'accepted' && recoveryConfig === undefined && signAndSubmit === null &&
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

                        <Row className="legal-officers">
                            <Col md={6}>
                                <SelectLegalOfficer
                                    legalOfficerNumber={ 1 }
                                    legalOfficer={ legalOfficer1 }
                                    otherLegalOfficer={ legalOfficer2 }
                                    legalOfficers={ availableLegalOfficers }
                                    mode="view"
                                    status={ legalOfficer1Status }
                                />
                            </Col>
                            <Col md={6}>
                                <SelectLegalOfficer
                                    legalOfficerNumber={ 2 }
                                    legalOfficer={ legalOfficer2 }
                                    otherLegalOfficer={ legalOfficer1 }
                                    legalOfficers={ availableLegalOfficers }
                                    mode="view"
                                    status={ legalOfficer2Status }
                                />
                            </Col>
                        </Row>

                        <Row className="footer">
                            <Col md={4} className="legal-officers-images">
                                <img className="legal-officer-male-image" alt="male legal officer" src={process.env.PUBLIC_URL + "/assets/landing/protection_male.svg"}/>
                                <img className="legal-officer-female-image" alt="female legal officer" src={process.env.PUBLIC_URL + "/assets/landing/protection_female.svg"}/>
                            </Col>
                            <Col md={8} className="legal-officers-text">
                                <p className="foundation"><strong>The foundation of</strong> your protection</p>
                                <p>
                                    In charge of a <strong>public office</strong>, Logion Legal Officers are <strong>identified Judicial Officers</strong>,<br/>who apply a
                                    strict code of ethics and are <strong>legaly responsible</strong> for their actions<br/>
                                    while legally securing your digital assets and digital transactions.
                                </p>
                            </Col>
                        </Row>
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

interface HeaderProps {
    color: string;
    icon: string;
    text: string;
}

function Header(props: HeaderProps) {
    const backgroundColor = rgbaToHex(props.color, 0.2);
    return (
        <div
            className="header"
        >
            <Icon
                icon={{id: props.icon}}
            />
            <br/>
            <p
                className="text"
                style={{
                    color: props.color,
                    borderColor: props.color,
                    backgroundColor: backgroundColor,
                }}
            >
                { props.text }
            </p>
        </div>
    );
}
