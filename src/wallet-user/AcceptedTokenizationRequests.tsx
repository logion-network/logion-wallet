import React from 'react';

import Table from 'react-bootstrap/Table';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

import { useUserContext } from './UserContext';

export default function AcceptedTokenizationRequests() {
    const { acceptedTokenizationRequests } = useUserContext();

    if(acceptedTokenizationRequests === null) {
        return null;
    }

    return (
        <>
            <h1>Accepted Tokenization Requests</h1>
            <Table striped bordered>
                <thead>
                    <tr>
                        <th>Legal Officer</th>
                        <th>Token</th>
                        <th>Bars</th>
                        <th>Timestamp</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        acceptedTokenizationRequests.map(request => (
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
                                <td>{request.decisionOn || ""}</td>
                            </tr>
                        ))
                    }
                </tbody>
            </Table>
        </>
    );
}
