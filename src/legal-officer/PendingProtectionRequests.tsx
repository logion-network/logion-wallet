import React, { useState, useCallback } from 'react';
import moment from 'moment';

import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Form from 'react-bootstrap/Form';

import Button from '../common/Button';
import Table, { Cell, EmptyTableMessage, DateCell } from '../common/Table';
import { sign } from '../logion-chain/Signature';
import { useRootContext } from '../RootContext';

import { useLegalOfficerContext } from './LegalOfficerContext';
import { acceptProtectionRequest, rejectProtectionRequest, decision } from './Model';
import { ProtectionRequest } from './Types';
import ProcessStep from './ProcessStep';
import ProtectionRequestStatus from './ProtectionRequestStatus';
import ProtectionRequestDetails from './ProtectionRequestDetails';
import { useHistory } from "react-router-dom";
import { recoveryDetailsPath } from "./LegalOfficerPaths";
import AccountInfo from "../common/AccountInfo";

enum ReviewStatus {
    NONE,
    PENDING,
    REJECTING
}

interface ReviewState {
    status: ReviewStatus,
    request?: ProtectionRequest,
}

const NO_REVIEW_STATE = { status: ReviewStatus.NONE };

export interface Props {
    recovery: boolean,
}

export default function PendingProtectionRequests(props: Props) {
    const { currentAddress } = useRootContext();
    const { pendingProtectionRequests, refreshRequests, pendingRecoveryRequests, colorTheme } = useLegalOfficerContext();
    const [ rejectReason, setRejectReason ] = useState<string>("");
    const [ reviewState, setReviewState ] = useState<ReviewState>(NO_REVIEW_STATE);
    const history = useHistory();

    const handleClose = useCallback(() => {
        setReviewState(NO_REVIEW_STATE);
    }, [ setReviewState ]);

    const rejectAndCloseModal = useCallback(() => {
        (async function() {
            const requestId = reviewState.request!.id;
            const signedOn = moment();
            const attributes = [ requestId, rejectReason ];
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
            setReviewState(NO_REVIEW_STATE);
            refreshRequests!();
        })();
    }, [ reviewState, currentAddress, rejectReason, setReviewState, refreshRequests ]);

    const acceptAndCloseModal = useCallback(() => {
        (async function() {
            const requestId = reviewState.request!.id;
            const signedOn = moment();
            const attributes = [ requestId ];
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
            setReviewState(NO_REVIEW_STATE);
            refreshRequests!();
        })();
    }, [ reviewState, currentAddress, setReviewState, refreshRequests ]);

    if (pendingProtectionRequests === null || pendingRecoveryRequests === null) {
        return null;
    }

    let requests;
    if(props.recovery) {
        requests = pendingRecoveryRequests;
    } else {
        requests = pendingProtectionRequests;
    }

    return (
        <>
            <Table
                columns={[
                    {
                        header: "First name",
                        render: request => <Cell content={ request.userIdentity.firstName }/>,
                        width: "200px",
                    },
                    {
                        header: "Last name",
                        render: request => <Cell content={ request.userIdentity.lastName }/>,
                        width: "200px",
                        renderDetails: request => <ProtectionRequestDetails request={ request } />,
                    },
                    {
                        header: "Status",
                        render: request => <ProtectionRequestStatus
                            decision={ decision(currentAddress, request.decisions)!.status}
                            status={ request.status }
                        />,
                        width: "140px",
                        splitAfter: true,
                    },
                    {
                        header: "Submission date",
                        render: request => <DateCell dateTime={ request.createdOn } />,
                        width: "120px",
                    },
                    {
                        header: "Account number",
                        render: request => <Cell content={ request.requesterAddress } overflowing tooltipId={ `dest-${request.id}` } />,
                    },
                    {
                        header: "Account to recover",
                        render: request => <Cell content={ request.addressToRecover } overflowing tooltipId={ `src-${request.id}` } />,
                    },
                    {
                        header: "Action",
                        render: request => (
                            <ButtonGroup aria-label="actions">
                                {!props.recovery &&
                                <Button
                                    variant="primary"
                                    onClick={() => setReviewState({status: ReviewStatus.PENDING, request: request}) }
                                    data-testid={`review-${request.id}`}
                                    colors={ colorTheme.buttons }
                                >
                                    Review and proceed
                                </Button>
                                }
                                {props.recovery &&
                                <Button
                                    variant="primary"
                                    colors={ colorTheme.buttons }
                                    onClick={ () => history.push(recoveryDetailsPath(request.id)) }
                                >
                                    Review and proceed
                                </Button>
                                }
                            </ButtonGroup>
                        ),
                    }
                ]}
                data={ requests }
                colorTheme={ colorTheme }
                renderEmpty={ () => <EmptyTableMessage>No request to display</EmptyTableMessage>}
            />

            {
                reviewState.status === ReviewStatus.PENDING &&
                <ProcessStep
                    active={ true }
                    closeCallback={ handleClose }
                    title={`Review ${reviewState.request!.id}`}
                    mayProceed={ true }
                    stepTestId={`modal-review-${reviewState.request!.id}`}
                    nextSteps={ [
                        {
                            id: "later",
                            callback: handleClose,
                            mayProceed: true,
                            buttonVariant: "secondary",
                            buttonText: "Later",
                            buttonTestId: `later-${reviewState.request!.id}`
                        },
                        {
                            id: "accept",
                            callback: acceptAndCloseModal,
                            mayProceed: true,
                            buttonVariant: "success",
                            buttonText: "Yes",
                            buttonTestId: `accept-${reviewState.request!.id}`
                        },
                        {
                            id: "reject",
                            callback: () => setReviewState({ ...reviewState, status: ReviewStatus.REJECTING }),
                            mayProceed: true,
                            buttonVariant: "danger",
                            buttonText: "No",
                            buttonTestId: `reject-${reviewState.request!.id}`
                        }
                    ] }
                >
                    <AccountInfo
                        label="Account address"
                        address={ reviewState.request!.requesterAddress }
                        identity={ reviewState.request!.userIdentity }
                        postalAddress={ reviewState.request!.userPostalAddress }
                        colorTheme={ colorTheme }
                    />
                    <p>I executed my due diligence and accept to be the Legal Officer of this user</p>
                </ProcessStep>
            }
            {
                reviewState.status === ReviewStatus.REJECTING &&
                <ProcessStep
                    active={ true }
                    closeCallback={ handleClose }
                    title={`Rejecting ${reviewState.request!.id}`}
                    mayProceed={ true }
                    stepTestId={`modal-review-${reviewState.request!.id}`}
                    nextSteps={ [
                        {
                            id: "later",
                            callback: handleClose,
                            mayProceed: true,
                            buttonVariant: "secondary",
                            buttonText: "Later",
                            buttonTestId: `later-${reviewState.request!.id}`
                        },
                        {
                            id: "confirm",
                            callback: rejectAndCloseModal,
                            mayProceed: true,
                            buttonVariant: "primary",
                            buttonText: "Confirm",
                            buttonTestId: `confirm-reject-${reviewState.request!.id}`
                        }
                    ] }
                >
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
                </ProcessStep>
            }
        </>
    );
}
