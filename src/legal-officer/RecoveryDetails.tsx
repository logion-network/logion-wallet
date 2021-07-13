import moment from 'moment';
import Form from 'react-bootstrap/Form';

import { useRootContext } from "../RootContext";
import { useLegalOfficerContext } from "./LegalOfficerContext";
import { FullWidthPane } from "../component/Dashboard";
import { useParams, useHistory } from 'react-router';
import { RECOVERY_REQUESTS_PATH } from "./LegalOfficerPaths";
import Button from "../component/Button";
import React, { useEffect, useState, useCallback } from "react";
import { ButtonGroup, Col, Row } from "react-bootstrap";
import { acceptProtectionRequest, fetchRecoveryInfo, rejectProtectionRequest } from "./Model";
import { RecoveryInfo } from "./Types";
import AccountInfo from "../component/AccountInfo";
import Alert from "../component/Alert";
import Frame from "../component/Frame";
import '../component/Position.css';
import Dialog from "../component/Dialog";
import { sign } from '../logion-chain';

export default function RecoveryDetails() {
    const { selectAddress, addresses } = useRootContext();
    const { colorTheme, refreshRequests } = useLegalOfficerContext();
    const { requestId } = useParams<{ requestId: string }>();
    const [ recoveryInfo, setRecoveryInfo ] = useState<RecoveryInfo | null>(null);
    const [ approve, setApprove ] = useState(false);
    const history = useHistory();
    const [ reject, setReject ] = useState(false);
    const [ rejectReason, setRejectReason ] = useState<string>("");

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
            refreshRequests!();
            history.push(RECOVERY_REQUESTS_PATH);
        })();
    }, [ requestId, addresses, refreshRequests, history ]);

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

    if (addresses === null || selectAddress === null || recoveryInfo === null) {
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
            addresses={ addresses }
            selectAddress={ selectAddress }
        >
            <Frame colors={ colorTheme }>
                <Row>
                    <Alert variant="info">
                        I did my due diligence and authorize the transfer of all assets<br />
                        from the account address "From" to the account address "To" as detailed below :
                    </Alert>
                </Row>
                <Row>
                    <Col md={ 5 }>
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
                    <Col md={ 1 }>
                        <p className="vertical-center">== RED ARROW ==&gt;</p>
                    </Col>
                    <Col md={ 5 }>
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
                                variant="outline-danger" onClick={ () => setReject(true) }>Refusal</Button>
                        <Button colors={ colorTheme.buttons }
                                variant="primary" onClick={ () => setApprove(true) }>Process</Button>
                    </ButtonGroup>
                </Row>
            </Frame>
            <Dialog
                actions={[
                    {
                        id: 'back',
                        buttonText: 'Back to requests list',
                        buttonVariant: 'secondary',
                        callback: () => history.push(RECOVERY_REQUESTS_PATH)
                    },
                    {
                        id: 'confirm',
                        buttonText: 'Confirm and sign',
                        buttonVariant: 'primary',
                        callback: accept
                    }
                ]}
                show={ approve }
                size="lg"
                colors={ colorTheme }
            >
                I did my due diligence and accept to grant the
                account { recoveryInfo.accountToRecover.requesterAddress } the right to transfer all assets
                to the account { recoveryInfo.recoveryAccount.requesterAddress }.
            </Dialog>
            <Dialog
                actions={[
                    {
                        id: 'back',
                        buttonText: 'Back to requests list',
                        buttonVariant: 'secondary',
                        callback: () => history.push(RECOVERY_REQUESTS_PATH)
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

