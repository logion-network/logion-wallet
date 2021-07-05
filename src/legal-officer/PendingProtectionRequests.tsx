import React, { useState, useCallback } from 'react';
import moment from 'moment';

import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

import Table from '../component/Table';
import Identity from '../component/Identity';
import PostalAddress from '../component/PostalAddress';
import { sign } from '../logion-chain';
import { useRootContext } from '../RootContext';

import { useLegalOfficerContext } from './LegalOfficerContext';
import { acceptProtectionRequest, rejectProtectionRequest } from './Model';
import { ProtectionRequest } from './Types';
import ProcessStep from './ProcessStep';

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
    const { pendingProtectionRequests, refreshRequests, pendingRecoveryRequests } = useLegalOfficerContext();
    const [ rejectReason, setRejectReason ] = useState<string>("");
    const [ reviewState, setReviewState ] = useState<ReviewState>(NO_REVIEW_STATE);

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
            <h2>Pending</h2>
            <Table
                columns={[
                    {
                        header: "Requester",
                        render: request => request.requesterAddress,
                    },
                    {
                        header: "Firstname",
                        render: request => request.userIdentity.firstName,
                    },
                    {
                        header: "Lastname",
                        render: request => request.userIdentity.lastName,
                    },
                    {
                        header: "Created",
                        render: request => request.createdOn,
                    },
                    {
                        header: "Action",
                        render: request => (
                            <ButtonGroup aria-label="actions">
                                <Button
                                    variant="primary"
                                    onClick={() => setReviewState({status: ReviewStatus.PENDING, request: request}) }
                                    data-testid={`review-${request.id}`}
                                >
                                    Review and proceed
                                </Button>
                            </ButtonGroup>
                        ),
                    }
                ]}
                data={ requests }
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
                    <Identity
                        identity={ reviewState.request!.userIdentity }
                    />
                    <PostalAddress
                        address={ reviewState.request!.userPostalAddress }
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
