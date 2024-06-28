import { PendingRecovery, ProtectionParameters, ProtectionRequestStatus, RejectedRecovery } from "@logion/client";
import { Col, Row } from 'react-bootstrap';

import Frame from "src/common/Frame";
import { GREEN, ORANGE, YELLOW, rgbaToHex } from "src/common/ColorTheme";
import Icon from "src/common/Icon";
import { useLogionChain } from "src/logion-chain";
import ButtonGroup from "src/common/ButtonGroup";
import Button from "src/common/Button";
import { useCallback } from "react";
import { useUserContext } from "../UserContext";
import ExtrinsicSubmissionStateView from "src/ExtrinsicSubmissionStateView";
import RecoveryRefusal from "./RecoveryRefusal";
import SelectLegalOfficer from "./SelectLegalOfficer";
import { useCommonContext } from "src/common/CommonContext";

export type ProtectionRecoveryRequestStatus = 'pending' | 'accepted' | 'activated' | 'unavailable' | 'rejected';

export type Refusal = 'single' | 'double' | 'none';

export interface Props {
    type: ProtectionRecoveryRequestStatus;
}

export default function AccountProtectionFrame(props: Props) {
    const { submitCall, clearSubmissionState, extrinsicSubmissionState } = useLogionChain();
    const { availableLegalOfficers } = useCommonContext();
    const { protectionState, activateProtection, claimRecovery } = useUserContext();

    const activateProtectionCallback = useCallback(async () => {
        try {
            await submitCall(activateProtection!);
        } catch(e) {
            console.log(e);
        } finally {
            clearSubmissionState();
        }
    }, [ submitCall, activateProtection, clearSubmissionState ]);

    const claimRecoveryCallback = useCallback(async () => {
        try {
            await submitCall(claimRecovery!);
        } catch(e) {
            console.log(e);
        } finally {
            clearSubmissionState();
        }
    }, [ submitCall, claimRecovery, clearSubmissionState ]);

    if(protectionState === undefined || availableLegalOfficers === undefined) {
        return null;
    }

    const protectionParameters = protectionState.protectionParameters;
    const legalOfficer1 = protectionParameters.legalOfficers[0];
    const legalOfficer2 = protectionParameters.legalOfficers[1];
    let legalOfficer1Status: ProtectionRequestStatus;
    let legalOfficer2Status: ProtectionRequestStatus;
    if(protectionState instanceof PendingRecovery || protectionState instanceof RejectedRecovery) {
        legalOfficer1Status = protectionParameters.states[0].status;
        legalOfficer2Status = protectionParameters.states[1].status;
    } else if(props.type === 'accepted') {
        legalOfficer1Status = 'ACCEPTED';
        legalOfficer2Status = 'ACCEPTED';
    } else {
        legalOfficer1Status = 'ACTIVATED';
        legalOfficer2Status = 'ACTIVATED';
    }

    let refusal: Refusal = 'none';
    if (props.type === 'rejected') {
            refusal = protectionState.protectionParameters.states[1].status === 'REJECTED' ? 'double' : 'single';
    }

    return (
        <Frame className="ProtectionRecoveryRequest">
            <Header type={ props.type } protectionParameters={ protectionParameters } />

            {
                props.type === 'accepted' && !protectionParameters.isActive && !extrinsicSubmissionState.inProgress &&
                <ButtonGroup className="Activate">
                    <Button
                        data-testid="btnActivate"
                        onClick={ activateProtectionCallback }
                        variant="polkadot"
                    >
                        Activate
                    </Button>
                </ButtonGroup>
            }
            {
                props.type === 'activated' && protectionParameters.isRecovery && !protectionParameters.isClaimed && !extrinsicSubmissionState.inProgress &&
                <ButtonGroup className="Claim">
                    <Button
                        data-testid="btnClaim"
                        onClick={ claimRecoveryCallback }
                        variant="polkadot"
                    >
                        Claim
                    </Button>
                </ButtonGroup>
            }
            <ExtrinsicSubmissionStateView />

            { refusal === 'double' &&
                <Row className="legal-officers">
                    <Col md={ 6 }>
                    <RecoveryRefusal
                        recovery={ protectionState as RejectedRecovery }
                        refusal={ refusal }
                    />
                    </Col>
                </Row>
            }
            <Row className="legal-officers">
                <Col md={6}>
                    <SelectLegalOfficer
                        legalOfficerNumber={ 1 }
                        legalOfficer={ legalOfficer1 }
                        otherLegalOfficer={ legalOfficer2 }
                        legalOfficers={ availableLegalOfficers }
                        mode="view"
                        label="Legal Officer N°1"
                        status={ legalOfficer1Status }
                    />
                </Col>
                <Col md={6}>
                    { refusal === 'single' &&
                        <RecoveryRefusal
                            recovery={ protectionState as RejectedRecovery }
                            refusal={ refusal }
                        />
                    }
                    { refusal !== 'single' &&
                        <SelectLegalOfficer
                            legalOfficerNumber={ 2 }
                            legalOfficer={ legalOfficer2 }
                            otherLegalOfficer={ legalOfficer1 }
                            legalOfficers={ availableLegalOfficers }
                            mode="view"
                            label="Legal Officer N°2"
                            status={ legalOfficer2Status }
                        />
                    }
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
    );
}

interface HeaderProps {
    type: ProtectionRecoveryRequestStatus;
    protectionParameters: ProtectionParameters;
}

function Header(props: HeaderProps) {
    const forAccount = props.protectionParameters.isRecovery ? ` for account ${props.protectionParameters.recoveredAccount?.address}` : "";

    let icon;
    let color;
    let text;
    if(props.type === 'pending') {
        if(props.protectionParameters.isRecovery) {
            icon = "pending";
            color = ORANGE;
            text = `Your Logion Recovery request ${forAccount} has been submitted for review. Your Legal Officers will contact you
            as soon as possible to finalize the procedure.`;
        } else {
            icon = "pending";
            color = ORANGE;
            text = `Your Logion Protection request has been submitted for review. Please note that, after the successful
            completion of one of your Legal Officer approval processes, you will be able to use all features
            provided by your logion account dashboard.`;
        }
    } else if(props.type === 'accepted') {
        if(props.protectionParameters.isRecovery) {
            icon = "accepted";
            color = YELLOW;
            text = `Your recovery request has been accepted by your Legal Officers.
            You may now activate your protection. This will require 2 signatures.
            After that, you'll be able to initiate the actual recovery.`;
        } else {
            icon = "accepted";
            color = YELLOW;
            text = `Your Logion Protection request has been accepted by your
            Legal Officers. You may now activate your protection.`;
        }
    } else if(props.type === 'activated') {
        if(props.protectionParameters.isRecovery && !props.protectionParameters.isClaimed) {
            icon = "activated";
            color = GREEN;
            text = `You are now ready to claim the access to address ${props.protectionParameters.recoveredAccount?.address}.`;
        } else {
            icon = "activated";
            color = GREEN;
            text = `Your Logion Protection is active`;
        }
    } else if (props.type === 'rejected') {
        if(props.protectionParameters.isRecovery) {
            icon = "pending";
            color = ORANGE;
            text=`Your Logion Recovery request has been submitted. It appears that at least one of the
            selected Legal Officers refused your request: you have to decide what would be the next step.
            Please note that, only after the successful completion of both of your Legal Officer approval
            processes, you will be able to retrieve your assets from your previous account.`;
        } else {
            icon = "pending";
            color = ORANGE;
            text = `Your Logion Protection request has been submitted. It appears that at least one of the
            selected Legal Officers refused your request: you have to decide what would be the next step.
            Please note that, only after the successful completion of your Legal Officer approval processes,
            you will be able to use all features provided by your logion account dashboard.`;
        }
    } else {
        throw new Error("Unsupported type");
    }

    const backgroundColor = rgbaToHex(color, 0.2);
    return (
        <div
            className="header"
        >
            <Icon
                icon={{id: icon}}
            />
            <br/>
            <p
                className="text"
                style={{
                    color: color,
                    borderColor: color,
                    backgroundColor: backgroundColor,
                }}
            >
                { text }
            </p>
        </div>
    );
}
