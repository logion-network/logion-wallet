import React from 'react';

import Table from 'react-bootstrap/Table';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

import { useUserContext } from './UserContext';

export default function PendingTokenizationRequests() {
    const { pendingTokenizationRequests } = useUserContext();

    if(pendingTokenizationRequests === null) {
        return null;
    }

    return (
        <>
            <h1>Pending Tokenization Requests</h1>
            <Table striped bordered>
                <thead>
                    <tr>
                        <th>Legal Officer</th>
                        <th>Token</th>
                        <th>Bars</th>
                        <th>Created</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        pendingTokenizationRequests.map(request => (
                            <tr key={request.id}>
                                <td>
                                    <OverlayTrigger
                                      key="top"
                                      placement="top"
                                      overlay={
                                        <Tooltip id={`tooltip-${request.id}`}>
                                          {request.legalOfficerAddress}
                                        </Tooltip>
                                      }
                                    >
                                      <span>Your Legal Officer</span>
                                    </OverlayTrigger>
                                </td>
                                <td>{request.requestedTokenName}</td>
                                <td>{request.bars}</td>
                                <td>{request.createdOn}</td>
                            </tr>
                        ))
                    }
                </tbody>
            </Table>
        </>
    );
}
