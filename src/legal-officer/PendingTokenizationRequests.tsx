import React, { useState, useEffect } from 'react';

import Table from 'react-bootstrap/Table';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';

import { useLegalOfficerContext } from './LegalOfficerContext';
import { TokenizationRequest } from './Model';

enum AcceptState {
    ACCEPTING,
    ISSUING,
    DONE
}

export default function PendingTokenizationRequests() {
    const { pendingTokenizationRequests, rejectRequest } = useLegalOfficerContext();
    const [ requestToReject, setRequestToReject ] = useState<string | null>(null);
    const [ reason, setReason ] = useState<string>("");
    const [ requestToAccept, setRequestToAccept ] = useState<TokenizationRequest | null>(null);
    const [ acceptState, setAcceptState ] = useState<AcceptState | null>(null);

    const handleClose = () => setRequestToReject(null);
    const rejectAndCloseModal = async () => {
        await rejectRequest!(requestToReject!, reason);
        setRequestToReject(null);
    };

    const handleCloseAccept = () => {
        setRequestToAccept(null);
        setAcceptState(null);
    }
    const getTokenizationRequest = (requestId: string): (TokenizationRequest | null) => {
        for(let i = 0; i < pendingTokenizationRequests!.length; ++i) {
            const request = pendingTokenizationRequests![i];
            if(request.id === requestId) {
                return request;
            }
        }
        return null;
    }

    useEffect(() => {
        if(acceptState === AcceptState.ACCEPTING) {
            // TODO: accept request (off-chain)
            setAcceptState(AcceptState.ISSUING);
        }
    }, [acceptState, setAcceptState]);

    useEffect(() => {
        if(acceptState === AcceptState.ISSUING) {
            // TODO: create asset and issue tokens (on-chain)
            setAcceptState(AcceptState.DONE);
        }
    }, [acceptState, setAcceptState]);

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

            <Modal
                show={requestToReject !== null}
                onHide={handleClose}
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Rejecting {requestToReject}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group controlId="exampleForm.ControlTextarea1">
                        <Form.Label>Reason</Form.Label>
                        <Form.Control as="textarea" rows={3} onChange={e => setReason(e.target.value)} value={reason} data-testid="reason" />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={rejectAndCloseModal} data-testid={`confirm-reject-${requestToReject}`}>
                        Reject
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal
                show={requestToAccept !== null && acceptState === null}
                onHide={handleCloseAccept}
                backdrop="static"
                keyboard={false}
                size="lg"
                data-testid="modal-accepting-${requestToAccept?.id}"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Accept request {requestToAccept ? requestToAccept.id : ""}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Alert variant="info">
                        <p>You are about to</p>
                        <ol>
                            <li>accept the request,</li>
                            <li>create an asset and</li>
                            <li>issue {requestToAccept ? requestToAccept.bars : ""} tokens
                            on account {requestToAccept ? requestToAccept.requesterAddress : ""}.</li>
                        </ol>
                    </Alert>

                    <Alert variant="warning">
                        <p>Once started, the process has to be completed with no interruption.</p>
                    </Alert>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseAccept}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={() => setAcceptState(AcceptState.ACCEPTING)} data-testid={`proceed-accept-${requestToAccept?.id}`}>
                        Proceed
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal
                show={requestToAccept !== null && acceptState === AcceptState.ACCEPTING}
                backdrop="static"
                keyboard={false}
                size="lg"
                data-testid="modal-accepted-${requestToAccept?.id}"
            >
                <Modal.Header>
                    <Modal.Title>Issuing tokens for request {requestToAccept ? requestToAccept.id : ""}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Alert variant="info">
                    <p>You are about to</p>
                        <ol>
                            <li>create an asset and</li>
                            <li>issue {requestToAccept ? requestToAccept.bars : ""} tokens
                            on account {requestToAccept ? requestToAccept.requesterAddress : ""}.</li>
                        </ol>
                    </Alert>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => setAcceptState(AcceptState.ISSUING)} data-testid={`proceed-issue-${requestToAccept?.id}`}>
                        Proceed
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal
                show={requestToAccept !== null && acceptState === AcceptState.DONE}
                onHide={handleCloseAccept}
                backdrop="static"
                keyboard={false}
                size="lg"
                data-testid="modal-issued-${requestToAccept?.id}"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Tokens issued for request {requestToAccept ? requestToAccept.id : ""}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Alert variant="success">
                    {requestToAccept ? requestToAccept.bars : ""} tokens were successfully issued
                    on account {requestToAccept ? requestToAccept.requesterAddress : ""}.
                    </Alert>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleCloseAccept} data-testid={`close-accept-${requestToAccept?.id}`}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
