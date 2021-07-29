import moment from 'moment';
import Form from 'react-bootstrap/Form';

import { useCommonContext } from "../common/CommonContext";
import { useLegalOfficerContext } from "./LegalOfficerContext";
import { FullWidthPane } from "../common/Dashboard";
import { useParams, useHistory } from 'react-router';
import { RECOVERY_REQUESTS_PATH } from "./LegalOfficerPaths";
import Button from "../common/Button";
import React, { useEffect, useState, useCallback } from "react";
import { Col, Row } from "react-bootstrap";
import { acceptProtectionRequest, fetchRecoveryInfo, rejectProtectionRequest } from "./Model";
import { RecoveryInfo } from "./Types";
import AccountInfo from "../common/AccountInfo";
import Alert from "../common/Alert";
import Frame from "../common/Frame";
import "./RecoveryDetails.css"
import Spacer from "../common/Spacer";
import Icon from "../common/Icon";
import Dialog from "../common/Dialog";
import { useLogionChain } from '../logion-chain';
import { sign } from "../logion-chain/Signature";
import { vouchRecovery } from '../logion-chain/Recovery';
import ExtrinsicSubmitter, { SignAndSubmit } from '../ExtrinsicSubmitter';
import ButtonGroup from "../common/ButtonGroup";

export default function RecoveryDetails() {
    const { addresses } = useCommonContext();
    const { api } = useLogionChain();
    const { colorTheme, refreshRequests } = useLegalOfficerContext();
    const { requestId } = useParams<{ requestId: string }>();
    const [ recoveryInfo, setRecoveryInfo ] = useState<RecoveryInfo | null>(null);
    const [ approve, setApprove ] = useState(false);
    const history = useHistory();
    const [ reject, setReject ] = useState(false);
    const [ rejectReason, setRejectReason ] = useState<string>("");
    const [ signAndSubmit, setSignAndSubmit ] = useState<SignAndSubmit>(null);

    useEffect(() => {
        if (recoveryInfo === null) {
            fetchRecoveryInfo(requestId)
                .then(recoveryInfo => setRecoveryInfo(recoveryInfo));
        }
    }, [ recoveryInfo, setRecoveryInfo, requestId ]);

    const accept = useCallback(() => {
        (async function() {
            const signedOn = moment();
            const attributes = [ requestId ];
            const currentAddress = addresses!.currentAddress.address;
            const signature = await sign({
                signerId: currentAddress,
                resource: 'protection-request',
                operation: 'accept',
                signedOn,
                attributes
            });
            await acceptProtectionRequest({
                legalOfficerAddress: currentAddress,
                requestId,
                signature,
                signedOn,
            });
            const signAndSubmit: SignAndSubmit = (callback, errorCallback) => vouchRecovery({
                api: api!,
                callback,
                errorCallback,
                signerId: currentAddress,
                lost: recoveryInfo!.accountToRecover.requesterAddress,
                rescuer: recoveryInfo!.recoveryAccount.requesterAddress,
            });
            setSignAndSubmit(() => signAndSubmit);
        })();
    }, [ requestId, addresses, api, recoveryInfo ]);

    const doReject = useCallback(() => {
        (async function() {
            const signedOn = moment();
            const attributes = [ requestId ];
            const currentAddress = addresses!.currentAddress.address;
            const signature = await sign({
                signerId: currentAddress,
                resource: 'protection-request',
                operation: 'reject',
                signedOn,
                attributes
            });
            await rejectProtectionRequest({
                legalOfficerAddress: currentAddress,
                requestId,
                signature,
                rejectReason,
                signedOn,
            });
            refreshRequests!();
            history.push(RECOVERY_REQUESTS_PATH);
        })();
    }, [ requestId, addresses, rejectReason, refreshRequests, history ]);

    if (recoveryInfo === null) {
        return null;
    }

    return (
        <FullWidthPane
            className="RecoveryDetails"
            mainTitle="Account Recovery Execution"
            titleIcon={ {
                icon: {
                    id: 'recovery_request',
                    hasVariants: true,
                },
            } }
            colors={ colorTheme }
        >
            <Frame
                className="main-frame"
                colors={ colorTheme }
            >
                <Row>
                    <Alert variant="info">
                        I did my due diligence and authorize the transfer of all assets<br />
                        from the account address "From" to the account address "To" as detailed below :
                    </Alert>
                </Row>
                <Row>
                    <Spacer>
                        <Icon icon={ { id: 'arrow-recovery' } } />
                    </Spacer>
                    <Col className="AccountInfoFrom">
                        <h3>From</h3>
                        <AccountInfo
                            label="Account address, subject of the recovery"
                            address={ recoveryInfo.accountToRecover.requesterAddress }
                            identity={ recoveryInfo.accountToRecover.userIdentity }
                            postalAddress={ recoveryInfo.accountToRecover.userPostalAddress }
                            otherIdentity={ recoveryInfo.recoveryAccount.userIdentity }
                            otherPostalAddress={ recoveryInfo.recoveryAccount.userPostalAddress }
                            colorTheme={ colorTheme }
                        />
                    </Col>
                    <Col className="AccountInfoTo">
                        <h3>To</h3>
                        <AccountInfo
                            label="Account address where all assets will be transferred"
                            address={ recoveryInfo.recoveryAccount.requesterAddress }
                            identity={ recoveryInfo.recoveryAccount.userIdentity }
                            postalAddress={ recoveryInfo.recoveryAccount.userPostalAddress }
                            otherIdentity={ recoveryInfo.accountToRecover.userIdentity }
                            otherPostalAddress={ recoveryInfo.accountToRecover.userPostalAddress }
                            colorTheme={ colorTheme }
                        />
                    </Col>
                </Row>
                <Row>
                    <ButtonGroup aria-label="actions">
                        <Button colors={ colorTheme.buttons }
                                variant="outline-primary" onClick={ () => history.push(RECOVERY_REQUESTS_PATH) }>
                            Back to requests list
                        </Button>
                        <Button colors={ colorTheme.buttons }
                                variant="danger" onClick={ () => setReject(true) }>Refuse</Button>
                        <Button colors={ colorTheme.buttons }
                                variant="primary" onClick={ () => setApprove(true) }>Proceed</Button>
                    </ButtonGroup>
                </Row>
            </Frame>
            <Dialog
                actions={[
                    {
                        id: 'back',
                        buttonText: 'Back',
                        buttonVariant: 'secondary',
                        callback: () => setApprove(false),
                        disabled: signAndSubmit !== null
                    },
                    {
                        id: 'confirm',
                        buttonText: 'Confirm and sign',
                        buttonVariant: 'primary',
                        callback: accept,
                        disabled: signAndSubmit !== null
                    }
                ]}
                show={ approve }
                size="lg"
                colors={ colorTheme }
            >
                <p>
                    I did my due diligence and accept to grant the
                    account { recoveryInfo.accountToRecover.requesterAddress } the right to transfer all assets
                    to the account { recoveryInfo.recoveryAccount.requesterAddress }.
                </p>
                <ExtrinsicSubmitter
                    id="vouch"
                    signAndSubmit={ signAndSubmit }
                    onSuccess={ () => { setSignAndSubmit(null); refreshRequests!(); history.push(RECOVERY_REQUESTS_PATH); } }
                    onError={ () => {} }
                />
            </Dialog>
            <Dialog
                actions={[
                    {
                        id: 'back',
                        buttonText: 'Back',
                        buttonVariant: 'secondary',
                        callback: () => setReject(false)
                    },
                    {
                        id: 'reject',
                        buttonText: 'Refuse',
                        buttonVariant: 'primary',
                        callback: doReject
                    }
                ]}
                show={ reject }
                size="lg"
                colors={ colorTheme }
            >
                I did my due diligence and refuse to grant the
                account { recoveryInfo.accountToRecover.requesterAddress } the right to transfer all assets
                to the account { recoveryInfo.recoveryAccount.requesterAddress }.
                <Form.Group>
                    <Form.Label>Reason</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        onChange={ e => setRejectReason(e.target.value) }
                        value={ rejectReason }
                        data-testid="reason"
                    />
                </Form.Group>
            </Dialog>
        </FullWidthPane>
    );
}

