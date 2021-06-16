import React from 'react';

import Table from 'react-bootstrap/Table';

import { useRootContext } from '../RootContext';

import { useLegalOfficerContext } from './LegalOfficerContext';
import { decision } from './Model';

export default function ProtectionRequestsHistory() {
    const { currentAddress } = useRootContext();
    const { protectionRequestsHistory } = useLegalOfficerContext();

    if (protectionRequestsHistory === null) {
        return null;
    }

    return (
        <>
            <h2>History</h2>
            <Table striped bordered responsive>
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
                                <td>{ decision(currentAddress, request.decisions)!.status }</td>
                                <td>{ decision(currentAddress, request.decisions)!.decisionOn }</td>
                            </tr>
                        ))
                    }
                </tbody>
            </Table>
        </>
    );
}
