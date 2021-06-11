import React from 'react';

import Table from 'react-bootstrap/Table';

import { useLegalOfficerContext } from './LegalOfficerContext';
import { decision } from './Model';

export default function ProtectionRequestsHistory() {
    const { legalOfficerAddress, protectionRequestsHistory } = useLegalOfficerContext();

    if (protectionRequestsHistory === null) {
        return null;
    }

    return (
        <>
            <h2>History</h2>
            <Table striped bordered>
                <thead>
                    <tr>
                        <th>Requester</th>
                        <th>Firstname</th>
                        <th>Lastname</th>
                        <th>Decision</th>
                        <th>Timestamp</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        protectionRequestsHistory.map(request => (
                            <tr key={request.id}>
                                <td>{ request.requesterAddress }</td>
                                <td>{ request.userIdentity.firstName }</td>
                                <td>{ request.userIdentity.lastName }</td>
                                <td>{ decision(legalOfficerAddress, request.decisions)!.status }</td>
                                <td>{ decision(legalOfficerAddress, request.decisions)!.decisionOn }</td>
                            </tr>
                        ))
                    }
                </tbody>
            </Table>
        </>
    );
}
