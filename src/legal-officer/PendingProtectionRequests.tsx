import React, { useState, useCallback } from 'react';
import moment from 'moment';

import Table from 'react-bootstrap/Table';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

import { sign } from '../logion-chain';

import { useLegalOfficerContext } from './LegalOfficerContext';
import { ProtectionRequest, acceptProtectionRequest, rejectProtectionRequest } from './Model';
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

export default function PendingProtectionRequests() {
    const { pendingProtectionRequests, legalOfficerAddress } = useLegalOfficerContext();
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
                signerId: legalOfficerAddress,
                resource: 'protection-request',
                operation: 'reject',
                signedOn,
                attributes
            });
            await rejectProtectionRequest({
                requestId,
                signature,
                rejectReason,
                signedOn,
            });
            setReviewState(NO_REVIEW_STATE);
        })();
    }, [ reviewState, legalOfficerAddress, rejectReason, setReviewState ]);

    const acceptAndCloseModal = useCallback(() => {
        (async function() {
            const requestId = reviewState.request!.id;
            const signedOn = moment();
            const attributes = [ requestId ];
            const signature = await sign({
                signerId: legalOfficerAddress,
                resource: 'protection-request',
                operation: 'accept',
                signedOn,
                attributes
            });
            await acceptProtectionRequest({
                requestId,
                signature,
                signedOn,
            });
            setReviewState(NO_REVIEW_STATE);
        })();
    }, [ reviewState, legalOfficerAddress, setReviewState ]);

    if (pendingProtectionRequests === null) {
        return null;
    }

    return (
        <>
            <h2>Pending</h2>
            <Table striped bordered>
                <thead>
                    <tr>
                        <th>Requester</th>
                        <th>Firstname</th>
                        <th>Lastname</th>
                        <th>Created</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        pendingProtectionRequests.map(request => (
                            <tr key={request.id}>
                                <td>TODO</td>
                                <td>TODO</td>
                                <td>TODO</td>
                                <td>TODO</td>
                                <td>
                                    <ButtonGroup aria-label="actions">
                                        <Button
                                            variant="success"
                                            onClick={() => setReviewState({status: ReviewStatus.PENDING, request: request}) }
                                            data-testid={`review-${request.id}`}
                                        >
                                            Review and proceed
                                        </Button>
                                    </ButtonGroup>
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </Table>

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
                    <p>TODO fields</p>
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
