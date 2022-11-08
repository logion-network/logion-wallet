import { useCallback, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { ProtectionRequest } from "@logion/client/dist/RecoveryClient";
import { OpenLoc } from "@logion/client";
import { vouchRecovery, getActiveRecovery } from "@logion/node-api/dist/Recovery";
import { Col, Row } from "react-bootstrap";

import Button from "../common/Button";
import ProcessStep from "../legal-officer/ProcessStep";
import Alert from "../common/Alert";
import ExtrinsicSubmitter, { SignAndSubmit } from "../ExtrinsicSubmitter";

import { useLocContext } from "./LocContext";
import Icon from "../common/Icon";

import { acceptProtectionRequest } from "./Model";
import { useLegalOfficerContext } from "../legal-officer/LegalOfficerContext";
import { PROTECTION_REQUESTS_PATH, RECOVERY_REQUESTS_PATH } from "../legal-officer/LegalOfficerPaths";
import StaticLabelValue from "../common/StaticLabelValue";
import { useLogionChain } from "../logion-chain";
import { signAndSend } from "../logion-chain/Signature";
import ClientExtrinsicSubmitter, { Call, CallCallback } from "src/ClientExtrinsicSubmitter";
import { closeLoc } from "src/legal-officer/client";

import './CloseLocButton.css';

enum CloseStatus {
    NONE,
    START,
    ACCEPT,
    CLOSE_PENDING,
    CLOSING,
    ERROR,
    VOUCHING,
    ACCEPTING,
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
    const { accounts, axiosFactory, api, signer } = useLogionChain();
    const { refreshRequests } = useLegalOfficerContext();
    const { mutateLocState, locItems, loc } = useLocContext();
    const [ closeState, setCloseState ] = useState<CloseState>({ status: CloseStatus.NONE });
    const [ call, setCall ] = useState<Call>();
    const [ disabled, setDisabled ] = useState<boolean>(false);
    const [ signAndSubmitVouch, setSignAndSubmitVouch ] = useState<SignAndSubmit>(null);

    useEffect(() => {
        if (closeState.status === CloseStatus.CLOSE_PENDING) {
            setCloseState({ status: CloseStatus.CLOSING });
            const call: Call = async (callback: CallCallback) =>
                mutateLocState(async current => {
                    if(signer && current instanceof OpenLoc) {
                        return closeLoc({
                            locState: current,
                            signer,
                            callback,
                        });
                    } else {
                        return current;
                    }
                });
            setCall(() => call);
        }
    }, [ mutateLocState, closeState, setCloseState, signer ]);

    useEffect(() => {
        if (locItems.findIndex(locItem => locItem.status === "DRAFT") < 0) {
            setDisabled(false)
        } else {
            setDisabled(true)
        }
    }, [ locItems, setDisabled ]);

    const alreadyVouched = useCallback(async (lost: string, rescuer: string, currentAddress: string) => {
        const activeRecovery = await getActiveRecovery({
            api: api!,
            sourceAccount: lost,
            destinationAccount: rescuer
        });

        return !!(activeRecovery && activeRecovery.legalOfficers.find(lo => lo === currentAddress));

    }, [ api ]);

    const onCloseSuccess = useCallback(async () => {
        if(props.protectionRequest && !props.protectionRequest.isRecovery) {
            setCloseState({ status: CloseStatus.ACCEPTING });
        } else if(props.protectionRequest && props.protectionRequest.isRecovery) {

            const lost = props.protectionRequest!.addressToRecover!;
            const rescuer = props.protectionRequest!.requesterAddress;
            const currentAddress = accounts!.current!.address;

            if (await alreadyVouched(lost, rescuer, currentAddress)) {
                setCloseState({ status: CloseStatus.ACCEPTING });
            } else {
                setCloseState({ status: CloseStatus.VOUCHING });

                const signAndSubmit: SignAndSubmit = (callback, errorCallback) => signAndSend({
                    signerId: currentAddress,
                    callback,
                    errorCallback,
                    submittable: vouchRecovery({
                        api: api!,
                        lost,
                        rescuer,
                    })
                });
                setSignAndSubmitVouch(() => signAndSubmit);
            }
        } else {
            setCloseState({ status: CloseStatus.NONE });
        }
    }, [ props.protectionRequest, accounts, api, alreadyVouched ]);

    useEffect(() => {
        if (closeState.status === CloseStatus.ACCEPTING && loc) {
            setCloseState({ status: CloseStatus.NONE });
            (async function() {
                const currentAddress = accounts!.current!.address;
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
            })();
        }
    }, [ closeState, setCloseState, accounts, axiosFactory, loc, navigate, props.protectionRequest, refreshRequests ]);

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
        firstStatus = CloseStatus.START;
        iconId = "lock";
    }

    return (
        <div className="CloseLocButton">
            {
                !loc.closed &&
                <Button
                    onClick={ () => setCloseState({ status: firstStatus }) }
                    className="close"
                    disabled={ disabled }
                >
                    <Icon icon={{ id: iconId }} height="19px" /><span className="text">{ closeButtonText }</span>
                </Button>
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
                active={ closeState.status === CloseStatus.START || closeState.status === CloseStatus.CLOSE_PENDING }
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
                        mayProceed: closeState.status === CloseStatus.START,
                        callback: () => setCloseState({ status: CloseStatus.CLOSE_PENDING })
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
                nextSteps={[]}
                hasSideEffect
            >
                <ClientExtrinsicSubmitter
                    call={ call }
                    onSuccess={ onCloseSuccess }
                    onError={ () => setCloseState({ status: CloseStatus.ERROR }) }
                />
            </ProcessStep>
            <ProcessStep
                active={ closeState.status === CloseStatus.ERROR }
                title="Close this Case (2/2)"
                nextSteps={[
                    {
                        id: 'ok',
                        buttonText: 'OK',
                        buttonVariant: 'primary',
                        mayProceed: true,
                        callback: () => setCloseState({ status: CloseStatus.NONE })
                    }
                ]}
            >
                <Alert variant="danger">
                    Could not close LOC.
                </Alert>
            </ProcessStep>
            <ProcessStep
                active={ closeState.status === CloseStatus.VOUCHING }
                title="Vouching"
                nextSteps={[]}
                hasSideEffect
            >
                <ExtrinsicSubmitter
                    id="publishMetadata"
                    signAndSubmit={ signAndSubmitVouch }
                    onSuccess={ () => setCloseState({ status: CloseStatus.ACCEPTING }) }
                    onError={ () => setCloseState({ status: CloseStatus.ERROR }) }
                />
            </ProcessStep>
        </div>
    )
}
