import React, { useState } from 'react';

import Table from 'react-bootstrap/Table';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';

import { useLegalOfficerContext } from './LegalOfficerContext';

export default function PendingTokenizationRequests() {
    const { pendingTokenizationRequests, rejectRequest } = useLegalOfficerContext();
    const [ requestToReject, setRequestToReject ] = useState<string | null>(null);
    const [ reason, setReason ] = useState<string>("");

    if (pendingTokenizationRequests === null) {
        return null;
    }

    const handleClose = () => setRequestToReject(null);
    const rejectAndCloseModal = async () => {
        await rejectRequest!(requestToReject!, reason);
        setRequestToReject(null);
    };

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

            <Modal show={requestToReject !== null} onHide={handleClose}>
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
        </>
    );
}
