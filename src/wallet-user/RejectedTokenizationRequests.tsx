import React from 'react';

import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

import { useUserContext } from './UserContext';

export default function RejectedTokenizationRequests() {
    const { rejectedTokenizationRequests, refreshRejectedRequests } = useUserContext();

    if(rejectedTokenizationRequests === null || refreshRejectedRequests === null) {
        return null;
    }

    return (
        <>
            <h1>Rejected Tokenization Requests</h1>
            <Button onClick={refreshRejectedRequests}>Refresh</Button>
            <Table striped bordered>
                <thead>
                    <tr>
                        <th>Legal Officer</th>
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
                                      <span>Signed by Your Legal Officer</span>
                                    </OverlayTrigger>
                                </td>
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
