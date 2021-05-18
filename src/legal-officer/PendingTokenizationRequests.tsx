import React from 'react';

import Table from 'react-bootstrap/Table';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Button from 'react-bootstrap/Button';

import { useLegalOfficerContext } from './LegalOfficerContext';

export default function PendingTokenizationRequests() {
    const { pendingTokenizationRequests, rejectRequest } = useLegalOfficerContext();

    if(pendingTokenizationRequests === null) {
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
                        <th>bars</th>
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
                                            onClick={() => rejectRequest!(request.id)}
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
        </>
    );
}
