import React, { useState } from 'react';

import Table from 'react-bootstrap/Table';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

import { useLegalOfficerContext } from './LegalOfficerContext';
import { TokenizationRequest } from './Model';
import ProcessStep from './ProcessStep';
import TokenizationRequestAcceptance from './TokenizationRequestAcceptance';

export default function PendingTokenizationRequests() {
    const { pendingTokenizationRequests, rejectRequest } = useLegalOfficerContext();
    const [ requestToReject, setRequestToReject ] = useState<string | null>(null);
    const [ reason, setReason ] = useState<string>("");
    const [ requestToAccept, setRequestToAccept ] = useState<TokenizationRequest | null>(null);

    const handleClose = () => setRequestToReject(null);

    const rejectAndCloseModal = async () => {
        await rejectRequest!(requestToReject!, reason);
        setRequestToReject(null);
    };

    const getTokenizationRequest = (requestId: string): (TokenizationRequest | null) => {
        for(let i = 0; i < pendingTokenizationRequests!.length; ++i) {
            const request = pendingTokenizationRequests![i];
            if(request.id === requestId) {
                return request;
            }
        }
        return null;
    }

    if (pendingTokenizationRequests === null) {
        return null;
    }

    return (
        <>
            <h1>Pending Tokenization Requests</h1>
            <Table striped bordered>
                <thead>
                    <tr>
                        <th>Requester</th>
                        <th>Token</th>
                        <th>Bars</th>
                        <th>Created</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        pendingTokenizationRequests.map(request => (
                            <tr key={request.id}>
                                <td>{request.requesterAddress}</td>
                                <td>{request.requestedTokenName}</td>
                                <td>{request.bars}</td>
                                <td>{request.createdOn}</td>
                                <td>
                                    <ButtonGroup aria-label="actions">
                                        <Button
                                            variant="success"
                                            onClick={() => setRequestToAccept(getTokenizationRequest(request.id))}
                                            data-testid={`accept-${request.id}`}
                                        >
                                            V
                                        </Button>
                                        <Button
                                            variant="danger"
                                            onClick={() => setRequestToReject(request.id)}
                                            data-testid={`reject-${request.id}`}
                                        >
                                            X
                                        </Button>
                                    </ButtonGroup>
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </Table>

            {
                requestToReject !== null &&
                <ProcessStep
                    active={ requestToReject !== null }
                    closeCallback={ handleClose }
                    title={`Rejecting ${requestToReject}`}
                    mayProceed={ true }
                    proceedCallback={ rejectAndCloseModal }
                    stepTestId={`modal-reject-${requestToReject}`}
                    proceedButtonTestId={`confirm-reject-${requestToReject}`}
                >
                    <Form.Group controlId="exampleForm.ControlTextarea1">
                        <Form.Label>Reason</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            onChange={e => setReason(e.target.value)}
                            value={reason}
                            data-testid="reason"
                        />
                    </Form.Group>
                </ProcessStep>
            }

            <TokenizationRequestAcceptance
                requestToAccept={ requestToAccept }
                clearRequestToAccept={ () => setRequestToAccept(null) }
            />
        </>
    );
}
