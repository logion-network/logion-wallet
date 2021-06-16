import React from 'react';

import Table from 'react-bootstrap/Table';

import { useLegalOfficerContext } from './LegalOfficerContext';

export default function AcceptedTokenizationRequests() {
    const { acceptedTokenizationRequests } = useLegalOfficerContext();

    if(acceptedTokenizationRequests === null) {
        return null;
    }

    return (
        <>
            <h3>Accepted</h3>
            <Table striped bordered>
                <thead>
                    <tr>
                        <th>Requester</th>
                        <th>Token</th>
                        <th>Bars</th>
                        <th>Timestamp</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        acceptedTokenizationRequests.map(request => (
                            <tr key={request.id}>
                                <td>{request.requesterAddress}</td>
                                <td>{request.requestedTokenName}</td>
                                <td>{request.bars}</td>
                                <td>{request.decisionOn || ""}</td>
                            </tr>
                        ))
                    }
                </tbody>
            </Table>
        </>
    );
}
