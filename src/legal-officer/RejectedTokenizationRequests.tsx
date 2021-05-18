import React from 'react';

import Table from 'react-bootstrap/Table';

import { useLegalOfficerContext } from './LegalOfficerContext';

export default function RejectedTokenizationRequests() {
    const { rejectedTokenizationRequests } = useLegalOfficerContext();

    if(rejectedTokenizationRequests === null) {
        return null;
    }

    return (
        <>
            <h1>Rejected Tokenization Requests</h1>
            <Table striped bordered>
                <thead>
                    <tr>
                        <th>Requester</th>
                        <th>Token</th>
                        <th>bars</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        rejectedTokenizationRequests.map(request => (
                            <tr key={request.id}>
                                <td>{request.requesterAddress}</td>
                                <td>{request.requestedTokenName}</td>
                                <td>{request.bars}</td>
                            </tr>
                        ))
                    }
                </tbody>
            </Table>
        </>
    );
}
