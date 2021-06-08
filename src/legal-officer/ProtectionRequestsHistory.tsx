import React, { useState } from 'react';

import Table from 'react-bootstrap/Table';

import { useLegalOfficerContext } from './LegalOfficerContext';

export default function ProtectionRequestsHistory() {
    const { protectionRequestsHistory } = useLegalOfficerContext();

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
                                <td>TODO</td>
                                <td>TODO</td>
                                <td>TODO</td>
                                <td>TODO</td>
                                <td>TODO</td>
                            </tr>
                        ))
                    }
                </tbody>
            </Table>
        </>
    );
}
