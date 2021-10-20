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
import { vouchRecovery } from '../logion-chain/Recovery';
import ExtrinsicSubmitter, { SignAndSubmit } from '../ExtrinsicSubmitter';
import ButtonGroup from "../common/ButtonGroup";

export default function RecoveryDetails() {
    const { accounts, axiosFactory } = useCommonContext();
    const { api } = useLogionChain();
    const { refreshRequests } = useLegalOfficerContext();
    const { requestId } = useParams<{ requestId: string }>();
    const [ recoveryInfo, setRecoveryInfo ] = useState<RecoveryInfo | null>(null);
    const [ approve, setApprove ] = useState(false);
    const history = useHistory();
    const [ reject, setReject ] = useState(false);
    const [ rejectReason, setRejectReason ] = useState<string>("");
    const [ signAndSubmit, setSignAndSubmit ] = useState<SignAndSubmit>(null);

    useEffect(() => {
        if (recoveryInfo === null && axiosFactory !== undefined) {
            const currentAddress = accounts!.current!.address;
            fetchRecoveryInfo(axiosFactory(currentAddress)!, requestId)
                .then(recoveryInfo => setRecoveryInfo(recoveryInfo));
        }
    }, [ axiosFactory, accounts, recoveryInfo, setRecoveryInfo, requestId ]);

    const accept = useCallback(() => {
        (async function() {
            const currentAddress = accounts!.current!.address;
            await acceptProtectionRequest(axiosFactory!(currentAddress)!, {
                legalOfficerAddress: currentAddress,
                requestId,
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
    }, [ axiosFactory, requestId, accounts, api, recoveryInfo ]);

    const doReject = useCallback(() => {
        (async function() {
            const currentAddress = accounts!.current!.address;
            await rejectProtectionRequest(axiosFactory!(currentAddress)!, {
                legalOfficerAddress: currentAddress,
                requestId,
                rejectReason,
            });
            refreshRequests!(false);
            history.push(RECOVERY_REQUESTS_PATH);
        })();
    }, [ axiosFactory, requestId, accounts, rejectReason, refreshRequests, history ]);

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
        >
            <Frame className="main-frame">
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
                        />
                    </Col>
                </Row>
                <Row>
                    <ButtonGroup aria-label="actions">
                        <Button variant="outline-primary" onClick={ () => history.push(RECOVERY_REQUESTS_PATH) }>
                            Back to requests list
                        </Button>
                        <Button variant="danger" onClick={ () => setReject(true) }>Refuse</Button>
                        <Button variant="primary" onClick={ () => setApprove(true) }>Proceed</Button>
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
            >
                <p>
                    I did my due diligence and accept to grant the
                    account { recoveryInfo.accountToRecover.requesterAddress } the right to transfer all assets
                    to the account { recoveryInfo.recoveryAccount.requesterAddress }.
                </p>
                <ExtrinsicSubmitter
                    id="vouch"
                    signAndSubmit={ signAndSubmit }
                    onSuccess={ () => { setSignAndSubmit(null); refreshRequests!(false); history.push(RECOVERY_REQUESTS_PATH); } }
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

