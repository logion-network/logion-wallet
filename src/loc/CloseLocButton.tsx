import { useCallback, useMemo, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { ProtectionRequest, OpenLoc } from "@logion/client";
import { Col, Row } from "react-bootstrap";

import Button from "../common/Button";
import ProcessStep from "../common/ProcessStep";
import Alert from "../common/Alert";

import { useLocContext } from "./LocContext";
import Icon from "../common/Icon";

import { acceptProtectionRequest } from "./Model";
import { useLegalOfficerContext } from "../legal-officer/LegalOfficerContext";
import { PROTECTION_REQUESTS_PATH, RECOVERY_REQUESTS_PATH } from "../legal-officer/LegalOfficerPaths";
import StaticLabelValue from "../common/StaticLabelValue";
import { useLogionChain, CallCallback, SignAndSubmit } from "../logion-chain";
import { signAndSend } from "../logion-chain/Signature";
import ExtrinsicSubmissionStateView from "src/ExtrinsicSubmissionStateView";

import './CloseLocButton.css';
import Checkbox from "src/components/toggle/Checkbox";

enum CloseStatus {
    NONE,
    ACCEPT,
    CLOSE_PENDING,
    CLOSING,
    DONE
}

interface CloseState {
    status: CloseStatus;
}

export interface Props {
    protectionRequest?: ProtectionRequest | null;
}

export default function CloseLocButton(props: Props) {
    const navigate = useNavigate();
    const { accounts, axiosFactory, api, signer, submitCall, extrinsicSubmissionState, clearSubmissionState, submitSignAndSubmit } = useLogionChain();
    const { refreshRequests } = useLegalOfficerContext();
    const { mutateLocState,locItems, loc, locState } = useLocContext();
    const [ closeState, setCloseState ] = useState<CloseState>({ status: CloseStatus.NONE });
    const [ autoAck, setAutoAck ] = useState(false);

    const closeCall = useMemo(() => {
        return async (callback: CallCallback) =>
            mutateLocState(async current => {
                if(signer && current instanceof OpenLoc) {
                    return current.legalOfficer.close({
                        autoAck,
                        signer,
                        callback,
                    });
                } else {
                    return current;
                }
            });
    }, [ mutateLocState, autoAck, signer ]);

    const close = useCallback(() => {
        setCloseState({ status: CloseStatus.CLOSING });
        submitCall(closeCall);
    }, [ closeCall, submitCall ]);

    const clear = useCallback(() => {
        clearSubmissionState();
        setCloseState({ status: CloseStatus.NONE });
    }, [ clearSubmissionState]);

    const accept = useCallback(async () => {
        if (loc) {
            clear();

            const currentAddress = accounts!.current!.accountId.address;
            await acceptProtectionRequest(axiosFactory!(currentAddress)!, {
                requestId: props.protectionRequest!.id,
                locId: loc.id,
            });
            refreshRequests!(false);

            if(props.protectionRequest?.isRecovery) {
                navigate({pathname: RECOVERY_REQUESTS_PATH, search: "?tab=history"});
            } else {
                navigate({pathname: PROTECTION_REQUESTS_PATH, search: "?tab=history"});
            }
        }
    }, [ loc, clear, accounts, axiosFactory, navigate, props.protectionRequest, refreshRequests ]);

    const alreadyVouched = useCallback(async (lost: string, rescuer: string, currentAddress: string) => {
        const activeRecovery = await api!.queries.getActiveRecovery(
            lost,
            rescuer
        );
        return !!(activeRecovery && activeRecovery.legalOfficers.find(lo => lo === currentAddress));
    }, [ api ]);

    const vouchRecovery: SignAndSubmit = useMemo(() => {
        const currentAddress = accounts!.current!.accountId.address;
        if(props.protectionRequest && props.protectionRequest.isRecovery && currentAddress) {
            const lost = props.protectionRequest.addressToRecover!;
            const rescuer = props.protectionRequest.requesterAddress;

            return (callback, errorCallback) => signAndSend({
                signerId: currentAddress,
                callback,
                errorCallback,
                submittable: api!.polkadot.tx.recovery.vouchRecovery(
                    lost,
                    rescuer,
                ),
            });
        } else {
            return null;
        }
    }, [ props.protectionRequest, accounts, api ]);

    const clearAcceptOrVouch = useCallback(async () => {
        if(extrinsicSubmissionState.error || !props.protectionRequest) {
            clear();
        } else if(props.protectionRequest) {
            if(props.protectionRequest.isRecovery) {
                const lost = props.protectionRequest.addressToRecover!;
                const rescuer = props.protectionRequest.requesterAddress;
                const currentAddress = accounts!.current!.accountId.address;

                if (await alreadyVouched(lost, rescuer, currentAddress)) {
                    await accept();
                } else {
                    clearSubmissionState();
                    submitSignAndSubmit(vouchRecovery);
                }
            } else {
                await accept();
            }
        } else {
            throw new Error("Unexpected");
        }
    }, [
        props.protectionRequest,
        accounts,
        alreadyVouched,
        accept,
        clearSubmissionState,
        submitSignAndSubmit,
        vouchRecovery,
        clear,
        extrinsicSubmissionState.error,
    ]);

    const canAutoAck = useMemo(() => {
        if(locState instanceof OpenLoc) {
            return locItems.length > 0 && locState.legalOfficer.canAutoAck();
        } else {
            return false;
        }
    }, [ locItems, locState ]);

    const canClose = useMemo(() => {
        if(locState instanceof OpenLoc) {
            return locState.legalOfficer.canClose(autoAck);
        } else {
            return false;
        }
    }, [ locState, autoAck ]);

    if(!loc) {
        return null;
    }

    const seal = loc.seal;
    const locType = loc.locType;

    let closeButtonText;
    let firstStatus: CloseStatus;
    let iconId;
    if(props.protectionRequest) {
        closeButtonText = "Close and accept request";
        firstStatus = CloseStatus.ACCEPT;
        if(props.protectionRequest.isRecovery) {
            iconId = "recovery";
        } else {
            iconId = "shield";
        }
    } else {
        closeButtonText = "Close LOC";
        firstStatus = CloseStatus.CLOSE_PENDING;
        iconId = "lock";
    }

    return (
        <div className="CloseLocButton">
            {
                loc.status === "OPEN" &&
                <div className="toggle-button-container">
                    <div className="toggle-container">
                        <p>Acknowledge all?</p>
                        <Checkbox
                            skin="Toggle black"
                            checked={ autoAck }
                            setChecked={ (value) => setAutoAck(value) }
                            disabled={ !canAutoAck }
                        />
                    </div>
                    <div className="button-container">
                        <Button
                            onClick={ () => setCloseState({ status: firstStatus }) }
                            className="close"
                            disabled={ !canClose }
                        >
                            <Icon icon={{ id: iconId }} height="19px" /><span className="text">{ closeButtonText }</span>
                        </Button>
                    </div>
                </div>
            }
            <ProcessStep
                active={ closeState.status === CloseStatus.ACCEPT }
                title="Protection request approval"
                nextSteps={[
                    {
                        id: 'cancel',
                        buttonText: 'Cancel',
                        buttonVariant: 'secondary-polkadot',
                        mayProceed: true,
                        callback: () => setCloseState({ status: CloseStatus.NONE })
                    },
                    {
                        id: "confirm",
                        buttonText: "Confirm",
                        buttonVariant: "polkadot",
                        mayProceed: true,
                        callback: () => setCloseState({ status: CloseStatus.CLOSE_PENDING }),
                    }
                ]}
            >
                <p>You are about to close the identity LOC (ID: { loc.id.toDecimalString() }) you created with regard to a request for protection.</p>
                <p>By clicking on "Confirm" below, you will definitively accept to protect the account of the following person:</p>

                <Row>
                    <Col>
                        <StaticLabelValue
                            label='Account address'
                            value={ props.protectionRequest?.requesterAddress || "" }
                        />
                    </Col>
                </Row>

                <Row>
                    <Col md={6}>
                        <StaticLabelValue
                            label='First Name'
                            value={ props.protectionRequest?.userIdentity.firstName || "" }
                        />
                    </Col>
                    <Col md={6}>
                        <StaticLabelValue
                            label='Last Name'
                            value={ props.protectionRequest?.userIdentity.lastName || "" }
                        />
                    </Col>
                </Row>
                <Row>
                    <Col md={6}>
                        <StaticLabelValue
                            label='E-mail'
                            value={ props.protectionRequest?.userIdentity.email || "" }
                        />
                    </Col>
                    <Col md={6}>
                        <StaticLabelValue
                            label='Phone Number'
                            value={ props.protectionRequest?.userIdentity.phoneNumber || "" }
                        />
                    </Col>
                </Row>

                <h3>Address</h3>

                <Row>
                    <Col>
                        <StaticLabelValue
                            label='Line 1'
                            value={ props.protectionRequest?.userPostalAddress.line1 || "" }
                        />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <StaticLabelValue
                            label='Line 2'
                            value={ props.protectionRequest?.userPostalAddress.line2 || "" }
                        />
                    </Col>
                </Row>
                <Row>
                    <Col md={6}>
                        <StaticLabelValue
                            label='Postal Code'
                            value={ props.protectionRequest?.userPostalAddress.postalCode || "" }
                        />
                    </Col>
                    <Col md={6}>
                        <StaticLabelValue
                            label='City'
                            value={ props.protectionRequest?.userPostalAddress.city || "" }
                        />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <StaticLabelValue
                            label='Country'
                            value={ props.protectionRequest?.userPostalAddress.country || "" }
                        />
                    </Col>
                </Row>

                <p>I executed my due diligence and accept to be the legal officer of this user:</p>
            </ProcessStep>
            <ProcessStep
                active={ closeState.status === CloseStatus.CLOSE_PENDING }
                title={ locType !== "Identity" ? "Close this Case (1/2)" : "Close this Identity Case (1/2)" }
                nextSteps={[
                    {
                        id: 'cancel',
                        buttonText: 'Cancel',
                        buttonVariant: 'secondary-polkadot',
                        mayProceed: true,
                        callback: () => setCloseState({ status: CloseStatus.NONE })
                    },
                    {
                        id: 'proceed',
                        buttonText: 'Proceed',
                        buttonVariant: 'polkadot',
                        mayProceed: true,
                        callback: close,
                    }
                ]}
            >
                <Alert variant="info">
                    { locType !== "Identity" &&
                        <p>Warning: after processing and blockchain publication, this case cannot be opened again and
                            therefore will be completely sealed.</p>
                    }
                    { locType === "Identity" &&
                        <>
                            <p>Closing this Identity LOC will add a HASH of all identity records in the LOC. This HASH
                                will be published and publicly available in the current LOC as follow, proving - without
                                revealing related records - the identity verification due diligence you executed:</p>
                            <p><strong>Verified identity records existence proof:</strong></p>
                            <p>{ seal }</p>
                            <p>Warning: after processing and blockchain publication, this case cannot be opened again
                                and therefore will be completely sealed.</p>
                        </>
                    }
                </Alert>
            </ProcessStep>
            <ProcessStep
                active={ closeState.status === CloseStatus.CLOSING }
                title="Close this Case (2/2)"
                nextSteps={ extrinsicSubmissionState.callEnded ? [
                    {
                        buttonText: "Close",
                        buttonVariant: "primary",
                        id: "close",
                        mayProceed: true,
                        callback: clearAcceptOrVouch,
                    }
                ] : [] }
                hasSideEffect={ !extrinsicSubmissionState.callEnded }
            >
                <ExtrinsicSubmissionStateView />
            </ProcessStep>
        </div>
    )
}
