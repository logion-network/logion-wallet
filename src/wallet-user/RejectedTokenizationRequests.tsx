import React from 'react';

import Table from 'react-bootstrap/Table';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

import { useUserContext } from './UserContext';

export default function RejectedTokenizationRequests() {
    const { rejectedTokenizationRequests } = useUserContext();

    if(rejectedTokenizationRequests === null) {
        return null;
    }

    return (
        <>
            <h2>Rejected</h2>
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
