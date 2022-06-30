import { useEffect, useState, useCallback } from "react";
import { Col, Row } from "react-bootstrap";
import Form from 'react-bootstrap/Form';
import { vouchRecovery, getActiveRecovery } from '@logion/node-api/dist/Recovery';
import { UUID } from '@logion/node-api/dist/UUID';

import { useCommonContext } from "../common/CommonContext";
import { useLegalOfficerContext } from "./LegalOfficerContext";
import { FullWidthPane } from "../common/Dashboard";
import { useParams, useNavigate } from 'react-router';
import { identityLocDetailsPath, RECOVERY_REQUESTS_PATH } from "./LegalOfficerPaths";
import Button from "../common/Button";
import { acceptProtectionRequest, rejectProtectionRequest } from "../loc/Model";
import { fetchRecoveryInfo } from "./Model";
import { RecoveryInfo } from "./Types";
import AccountInfo from "../common/AccountInfo";
import Alert from "../common/Alert";
import Frame from "../common/Frame";
import "./RecoveryDetails.css"
import Spacer from "../common/Spacer";
import Icon from "../common/Icon";
import Dialog from "../common/Dialog";
import { useLogionChain } from '../logion-chain';
import ExtrinsicSubmitter, { SignAndSubmit } from '../ExtrinsicSubmitter';
import ButtonGroup from "../common/ButtonGroup";
import LocIdFormGroup from "./LocIdFormGroup";
import LocCreationDialog from "../loc/LocCreationDialog";
import { signAndSend } from "src/logion-chain/Signature";

enum Visible {
    NONE,
    APPROVE,
    REJECT,
    CREATE_NEW_LOC
}

export default function RecoveryDetails() {
    const { accounts, axiosFactory, api } = useLogionChain();
    const { colorTheme } = useCommonContext();
    const { refreshRequests } = useLegalOfficerContext();
    const { requestId } = useParams<"requestId">();
    const [ recoveryInfo, setRecoveryInfo ] = useState<RecoveryInfo | null>(null);
    const [ visible, setVisible ] = useState(Visible.NONE);
    const navigate = useNavigate();
    const [ rejectReason, setRejectReason ] = useState<string>("");
    const [ signAndSubmit, setSignAndSubmit ] = useState<SignAndSubmit>(null);
    const [ locId, setLocId ] = useState<UUID | undefined>();

    useEffect(() => {
        if (recoveryInfo === null && axiosFactory !== undefined) {
            const currentAddress = accounts!.current!.address;
            fetchRecoveryInfo(axiosFactory(currentAddress)!, requestId!)
                .then(recoveryInfo => setRecoveryInfo(recoveryInfo));
        }
    }, [ axiosFactory, accounts, recoveryInfo, setRecoveryInfo, requestId ]);

    const alreadyVouched = useCallback(async (lost: string, rescuer: string, currentAddress: string) => {
        const activeRecovery = await getActiveRecovery({
            api: api!,
            sourceAccount: lost,
            destinationAccount: rescuer
        });

        return !!(activeRecovery && activeRecovery.legalOfficers.find(lo => lo === currentAddress));

    }, [ api ]);

    const accept = useCallback(() => {
        (async function() {
            const currentAddress = accounts!.current!.address;
            const lost = recoveryInfo!.accountToRecover!.requesterAddress;
            const rescuer = recoveryInfo!.recoveryAccount.requesterAddress;
            await acceptProtectionRequest(axiosFactory!(currentAddress)!, {
                requestId: requestId!,
                locId: locId!
            });
            if (await alreadyVouched(lost, rescuer, currentAddress)) {
                refreshRequests!(false);
                navigate(RECOVERY_REQUESTS_PATH);
            } else {
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
                setSignAndSubmit(() => signAndSubmit);
            }
        })();
    }, [ axiosFactory, requestId, accounts, api, recoveryInfo, locId, alreadyVouched, navigate, refreshRequests ]);

    const doReject = useCallback(() => {
        (async function() {
            const currentAddress = accounts!.current!.address;
            await rejectProtectionRequest(axiosFactory!(currentAddress)!, {
                legalOfficerAddress: currentAddress,
                requestId: requestId!,
                rejectReason,
            });
            refreshRequests!(false);
            navigate(RECOVERY_REQUESTS_PATH);
        })();
    }, [ axiosFactory, requestId, accounts, rejectReason, refreshRequests, navigate ]);

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
                <Row>
                    <ButtonGroup aria-label="actions">
                        <Button variant="link" onClick={ () => navigate(RECOVERY_REQUESTS_PATH) }>
                            Back to requests list
                        </Button>
                        <Button variant="secondary" onClick={ () => setVisible(Visible.REJECT) }>Refuse</Button>
                        <Button
                            variant="primary"
                            choices={[
                                {
                                    text: "Create the required Identity LOC",
                                    onClick: () => setVisible(Visible.CREATE_NEW_LOC)
                                },
                                {
                                    text: "Link to an existing Identity LOC",
                                    onClick: () => setVisible(Visible.APPROVE)
                                }
                            ]}
                        >
                            Proceed
                        </Button>
                    </ButtonGroup>
                </Row>
            </Frame>
            <Dialog
                actions={[
                    {
                        id: 'back',
                        buttonText: 'Back',
                        buttonVariant: 'secondary',
                        callback: () => setVisible(Visible.NONE),
                        disabled: signAndSubmit !== null
                    },
                    {
                        id: 'confirm',
                        buttonText: 'Confirm and sign',
                        buttonVariant: 'primary',
                        callback: accept,
                        disabled: signAndSubmit !== null || locId === undefined
                    }
                ]}
                show={ visible === Visible.APPROVE }
                size="lg"
            >
                <p>
                    I did my due diligence and accept to grant the
                    account { recoveryInfo.accountToRecover?.requesterAddress } the right to transfer all assets
                    to the account { recoveryInfo.recoveryAccount.requesterAddress }.
                </p>
                <LocIdFormGroup
                    colors={ colorTheme.dialog }
                    expect={{
                        closed: true,
                        type: 'Identity',
                        requester: recoveryInfo.recoveryAccount.requesterAddress
                    }}
                    onChange={ setLocId }
                />
                <ExtrinsicSubmitter
                    id="vouch"
                    signAndSubmit={ signAndSubmit }
                    onSuccess={ () => { setSignAndSubmit(null); refreshRequests!(false); navigate(RECOVERY_REQUESTS_PATH); } }
                    onError={ () => {} }
                />
            </Dialog>
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
            <LocCreationDialog
                show={ visible === Visible.CREATE_NEW_LOC }
                exit={ () => navigate(RECOVERY_REQUESTS_PATH) }
                onSuccess={ (newLoc) => navigate({pathname: identityLocDetailsPath(newLoc.id), search: `recovery-request=${ requestId }`}) }
                locRequest={{
                    requesterAddress: recoveryInfo.recoveryAccount.requesterAddress,
                    userIdentity: recoveryInfo.recoveryAccount.userIdentity,
                    locType: 'Identity'
                }}
                hasLinkNature={ false }
                defaultDescription={ `KYC ${ recoveryInfo.recoveryAccount.userIdentity.firstName } ${ recoveryInfo.recoveryAccount.userIdentity.lastName } - ${ recoveryInfo.recoveryAccount.requesterAddress }` }
            />
        </FullWidthPane>
    );
}
