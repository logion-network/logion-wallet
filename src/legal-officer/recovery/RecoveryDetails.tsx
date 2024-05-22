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
import { RecoveryInfo, acceptAccountRecoveryRequest, acceptSecretRecoveryRequest, fetchRecoveryInfo, rejectAccountRecoveryRequest, rejectSecretRecoveryRequest, toRecoveryRequestType } from "../Model";
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
    const { type } = useParams<"type">();
    const [ recoveryInfo, setRecoveryInfo ] = useState<RecoveryInfo | null>(null);
    const [ visible, setVisible ] = useState(Visible.NONE);
    const navigate = useNavigate();
    const [ rejectReason, setRejectReason ] = useState<string>("");

    useEffect(() => {
        if (recoveryInfo === null && axiosFactory !== undefined) {
            const currentAccount = accounts!.current!.accountId;
            fetchRecoveryInfo(axiosFactory(currentAccount)!, requestId!, toRecoveryRequestType(type))
                .then(recoveryInfo => setRecoveryInfo(recoveryInfo));
        }
    }, [ axiosFactory, accounts, recoveryInfo, setRecoveryInfo, requestId, type ]);

    const alreadyVouched = useCallback(async (lost: ValidAccountId, rescuer: ValidAccountId, currentAddress: ValidAccountId) => {
        const activeRecovery = await api?.queries.getActiveRecovery(
            lost,
            rescuer
        );
        return !!(activeRecovery && activeRecovery.legalOfficers.find(lo => lo.equals(currentAddress)));
    }, [ api ]);

    const acceptAccountRecovery = useCallback(async () => {
        const currentAddress = accounts!.current!.accountId;
        const lost = ValidAccountId.polkadot(recoveryInfo!.accountRecovery!.address1);
        const rescuer = ValidAccountId.polkadot(recoveryInfo!.accountRecovery!.address2);

        if (await alreadyVouched(lost, rescuer, currentAddress)) {
            await acceptAccountRecoveryRequest(axiosFactory!(currentAddress)!, {
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
                await acceptAccountRecoveryRequest(axiosFactory!(currentAddress)!, {
                    requestId: requestId!,
                });
            };
            try {
                await submitCall(call);
                refreshRequests!(false);
                navigate(RECOVERY_REQUESTS_PATH);
            } catch(e) {
                console.log(e);
            } finally {
                clearSubmissionState();
            }
        }
    }, [ axiosFactory, requestId, accounts, api, recoveryInfo, alreadyVouched, navigate, refreshRequests, submitCall, clearSubmissionState, signer ]);

    const acceptSecretRecovery = useCallback(async () => {
        const currentAddress = accounts!.current!.accountId;
        await acceptSecretRecoveryRequest(axiosFactory!(currentAddress)!, {
            requestId: requestId!,
        });
        refreshRequests!(false);
        navigate(RECOVERY_REQUESTS_PATH);
    }, [ axiosFactory, requestId, accounts, navigate, refreshRequests ]);

    const doReject = useCallback(async () => {
        if(type === "ACCOUNT") {
            const currentAccount = accounts!.current!.accountId;
            await rejectAccountRecoveryRequest(axiosFactory!(currentAccount)!, {
                requestId: requestId!,
                rejectReason,
            });
            refreshRequests!(false);
            navigate(RECOVERY_REQUESTS_PATH);
        } else if(type === "SECRET") {
            const currentAccount = accounts!.current!.accountId;
            await rejectSecretRecoveryRequest(axiosFactory!(currentAccount)!, {
                requestId: requestId!,
                rejectReason,
            });
            refreshRequests!(false);
            navigate(RECOVERY_REQUESTS_PATH);
        } else {
            throw new Error(`Unsupported type ${ type }`);
        }
    }, [ axiosFactory, requestId, accounts, rejectReason, refreshRequests, navigate, type ]);

    if (!api || recoveryInfo === null) {
        return null;
    }

    return (
        <FullWidthPane
            className="RecoveryDetails"
            mainTitle="Recovery Request"
            titleIcon={ {
                icon: {
                    id: 'recovery_request',
                    hasVariants: true,
                },
            } }
        >
            <Frame className="main-frame">
                <Row>
                    <Spacer>
                        <Icon icon={ { id: 'arrow-recovery' } } />
                    </Spacer>
                    <Col className="AccountInfoFrom">
                        <h3>Identity 1</h3>
                        <Frame altColors={ true }>
                            <AccountInfo
                                label="Account address, subject of the recovery"
                                identity={ recoveryInfo.identity1?.userIdentity }
                                postalAddress={ recoveryInfo.identity1?.userPostalAddress }
                                otherIdentity={ recoveryInfo.identity2.userIdentity }
                                otherPostalAddress={ recoveryInfo.identity2.userPostalAddress }
                                colors={ colorTheme.dashboard }
                                squeeze={ true }
                                noComparison={ false }
                            />
                        </Frame>
                    </Col>
                    <Col className="AccountInfoTo">
                        <h3>Identity 2</h3>
                        <Frame altColors={ true }>
                            <AccountInfo
                                label="Account address where all assets will be transferred"
                                identity={ recoveryInfo.identity2.userIdentity }
                                postalAddress={ recoveryInfo.identity2.userPostalAddress }
                                otherIdentity={ recoveryInfo.identity1?.userIdentity }
                                otherPostalAddress={ recoveryInfo.identity1?.userPostalAddress }
                                colors={ colorTheme.dashboard }
                                squeeze={ true }
                                noComparison={ false }
                            />
                        </Frame>
                    </Col>
                </Row>
                {
                    recoveryInfo.type === "ACCOUNT" &&
                    <Row>
                        <Alert variant="info">
                            I did my due diligence and authorize the transfer of all assets
                            from the account address<br/>
                            <strong>{ recoveryInfo.accountRecovery?.address1 || "" }</strong><br/>
                            to the account address<br/>
                            <strong>{ recoveryInfo.accountRecovery?.address2 || "" }</strong>
                        </Alert>
                    </Row>
                }
                {
                    recoveryInfo.type === "SECRET" &&
                    <Row>
                        <Alert variant="info">
                            I did my due diligence and authorize the retrieval of a secret by the above person.
                        </Alert>
                    </Row>
                }
                <Row>
                    <ButtonGroup aria-label="actions">
                        <Button variant="link" onClick={ () => navigate(RECOVERY_REQUESTS_PATH) }>
                            Back to requests list
                        </Button>
                        <Button variant="secondary" onClick={ () => setVisible(Visible.REJECT) }>Refuse</Button>
                        {
                            recoveryInfo.type === "ACCOUNT" &&
                            <Button
                                variant="polkadot"
                                onClick={ acceptAccountRecovery }
                                disabled={ !extrinsicSubmissionState.canSubmit() && !extrinsicSubmissionState.callEnded }
                            >
                                Proceed
                            </Button>
                        }
                        {
                            recoveryInfo.type === "SECRET" &&
                            <Button
                                onClick={ acceptSecretRecovery }
                            >
                                Proceed
                            </Button>
                        }
                    </ButtonGroup>
                </Row>
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
                {
                    recoveryInfo.type === "ACCOUNT" &&
                    <>
                    I did my due diligence and refuse to grant the{" "}
                    account { recoveryInfo.accountRecovery?.address1 || "-" } the right to transfer all assets{" "}
                    to the account { recoveryInfo.accountRecovery?.address2 || "-" }.
                    </>
                }
                {
                    recoveryInfo.type === "SECRET" &&
                    <>
                    I did my due diligence and do not authorize the retrieval of a secret by the above person.
                    </>
                }
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
