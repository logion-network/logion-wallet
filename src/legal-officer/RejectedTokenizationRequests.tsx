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
            <h2>Rejected</h2>
            <Table striped bordered>
                <thead>
                    <tr>
                        <th>Requester</th>
                        <th>Token</th>
                        <th>Bars</th>
                        <th>Reason</th>
                        <th>Timestamp</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        rejectedTokenizationRequests.map(request => (
                            <tr key={request.id}>
                                <td>{request.requesterAddress}</td>
                                <td>{request.requestedTokenName}</td>
                                <td>{request.bars}</td>
                                <td>{request.rejectReason || ""}</td>
                                <td>{request.decisionOn || ""}</td>
                            </tr>
                        ))
                    }
                </tbody>
            </Table>
        </>
    );
}
