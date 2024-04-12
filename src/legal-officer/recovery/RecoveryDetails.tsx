import { ValidAccountId } from "@logion/node-api";
import { useEffect, useState, useCallback } from "react";
import { Col, Row } from "react-bootstrap";
import Form from 'react-bootstrap/Form';

import { useCommonContext } from "../../common/CommonContext";
import { useLegalOfficerContext } from "../LegalOfficerContext";
import { FullWidthPane } from "../../common/Dashboard";
import { useParams, useNavigate } from 'react-router';
import { RECOVERY_REQUESTS_PATH } from "../LegalOfficerPaths";
import Button from "../../common/Button";
import { acceptProtectionRequest, rejectProtectionRequest } from "../../loc/Model";
import { fetchRecoveryInfo } from "../Model";
import { RecoveryInfo } from "../Types";
import AccountInfo from "../../common/AccountInfo";
import Alert from "../../common/Alert";
import Frame from "../../common/Frame";
import "./RecoveryDetails.css"
import Spacer from "../../common/Spacer";
import Icon from "../../common/Icon";
import Dialog from "../../common/Dialog";
import { CallCallback, useLogionChain } from '../../logion-chain';
import ButtonGroup from "../../common/ButtonGroup";
import ExtrinsicSubmissionStateView from '../../ExtrinsicSubmissionStateView';

enum Visible {
    NONE,
    APPROVE,
    REJECT,
    CREATE_NEW_LOC
}

export default function RecoveryDetails() {
    const { accounts, axiosFactory, api, submitCall, signer, clearSubmissionState, extrinsicSubmissionState } = useLogionChain();
    const { colorTheme } = useCommonContext();
    const { refreshRequests } = useLegalOfficerContext();
    const { requestId } = useParams<"requestId">();
    const [ recoveryInfo, setRecoveryInfo ] = useState<RecoveryInfo | null>(null);
    const [ visible, setVisible ] = useState(Visible.NONE);
    const navigate = useNavigate();
    const [ rejectReason, setRejectReason ] = useState<string>("");

    useEffect(() => {
        if (recoveryInfo === null && axiosFactory !== undefined) {
            const currentAccount = accounts!.current!.accountId;
            fetchRecoveryInfo(axiosFactory(currentAccount)!, requestId!)
                .then(recoveryInfo => setRecoveryInfo(recoveryInfo));
        }
    }, [ axiosFactory, accounts, recoveryInfo, setRecoveryInfo, requestId ]);

    const alreadyVouched = useCallback(async (lost: ValidAccountId, rescuer: ValidAccountId, currentAddress: ValidAccountId) => {
        const activeRecovery = await api?.queries.getActiveRecovery(
            lost,
            rescuer
        );

        return !!(activeRecovery && activeRecovery.legalOfficers.find(lo => lo.equals(currentAddress)));

    }, [ api ]);

    const accept = useCallback(async () => {
        const currentAddress = accounts!.current!.accountId;
        const lost = ValidAccountId.polkadot(recoveryInfo!.accountToRecover!.requesterAddress);
        const rescuer = ValidAccountId.polkadot(recoveryInfo!.recoveryAccount.requesterAddress);

        if (await alreadyVouched(lost, rescuer, currentAddress)) {
            await acceptProtectionRequest(axiosFactory!(currentAddress)!, {
                requestId: requestId!,
            });
            refreshRequests!(false);
            navigate(RECOVERY_REQUESTS_PATH);
        } else {
            const submittable = api!.polkadot.tx.recovery.vouchRecovery(
                lost.address,
                rescuer.address,
            );
            const call = async (callback: CallCallback) => {
                await signer?.signAndSend({
                    signerId: currentAddress,
                    submittable,
                    callback,
                });
                await acceptProtectionRequest(axiosFactory!(currentAddress)!, {
                    requestId: requestId!,
                });
            };
            try {
                await submitCall(call);
                refreshRequests!(false);
                navigate(RECOVERY_REQUESTS_PATH);
            } finally {
                clearSubmissionState();
            }
        }
    }, [ axiosFactory, requestId, accounts, api, recoveryInfo, alreadyVouched, navigate, refreshRequests, submitCall, clearSubmissionState, signer ]);

    const doReject = useCallback(() => {
        (async function() {
            const currentAccount = accounts!.current!.accountId;
            await rejectProtectionRequest(axiosFactory!(currentAccount)!, {
                legalOfficerAddress: currentAccount.address,
                requestId: requestId!,
                rejectReason,
            });
            refreshRequests!(false);
            navigate(RECOVERY_REQUESTS_PATH);
        })();
    }, [ axiosFactory, requestId, accounts, rejectReason, refreshRequests, navigate ]);

    if (!api || recoveryInfo === null) {
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
                        <Frame altColors={ true }>
                            <AccountInfo
                                label="Account address, subject of the recovery"
                                address={ recoveryInfo.addressToRecover }
                                identity={ recoveryInfo.accountToRecover?.userIdentity }
                                postalAddress={ recoveryInfo.accountToRecover?.userPostalAddress }
                                otherIdentity={ recoveryInfo.recoveryAccount.userIdentity }
                                otherPostalAddress={ recoveryInfo.recoveryAccount.userPostalAddress }
                                colors={ colorTheme.dashboard }
                                squeeze={ true }
                                noComparison={ false }
                            />
                        </Frame>
                    </Col>
                    <Col className="AccountInfoTo">
                        <h3>To</h3>
                        <Frame altColors={ true }>
                            <AccountInfo
                                label="Account address where all assets will be transferred"
                                address={ recoveryInfo.recoveryAccount.requesterAddress }
                                identity={ recoveryInfo.recoveryAccount.userIdentity }
                                postalAddress={ recoveryInfo.recoveryAccount.userPostalAddress }
                                otherIdentity={ recoveryInfo.accountToRecover?.userIdentity }
                                otherPostalAddress={ recoveryInfo.accountToRecover?.userPostalAddress }
                                colors={ colorTheme.dashboard }
                                squeeze={ true }
                                noComparison={ false }
                            />
                        </Frame>
                    </Col>
                </Row>
                {
                    (extrinsicSubmissionState.canSubmit() || extrinsicSubmissionState.callEnded) &&
                    <Row>
                        <ButtonGroup aria-label="actions">
                            <Button variant="link" onClick={ () => navigate(RECOVERY_REQUESTS_PATH) }>
                                Back to requests list
                            </Button>
                            <Button variant="secondary" onClick={ () => setVisible(Visible.REJECT) }>Refuse</Button>
                            <Button
                                variant="polkadot"
                                onClick={ accept }
                            >
                                Proceed
                            </Button>
                        </ButtonGroup>
                    </Row>
                }
                <ExtrinsicSubmissionStateView />
            </Frame>
            <Dialog
                actions={[
                    {
                        id: 'back',
                        buttonText: 'Back',
                        buttonVariant: 'secondary',
                        callback: () => setVisible(Visible.NONE),
                    },
                    {
                        id: 'reject',
                        buttonText: 'Refuse',
                        buttonVariant: 'primary',
                        callback: doReject
                    }
                ]}
                show={ visible === Visible.REJECT }
                size="lg"
            >
                I did my due diligence and refuse to grant the
                account { recoveryInfo.accountToRecover?.requesterAddress || "-" } the right to transfer all assets
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
