import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';

import Table, { Cell, EmptyTableMessage, DateTimeCell } from '../common/Table';
import Button from '../common/Button';

import { useLegalOfficerContext } from './LegalOfficerContext';
import { TokenizationRequest } from '../common/types/ModelTypes';
import ProcessStep from './ProcessStep';
import TokenizationRequestAcceptance from './TokenizationRequestAcceptance';

export default function PendingTokenizationRequests() {
    const { pendingTokenizationRequests, rejectRequest } = useLegalOfficerContext();
    const [ requestToReject, setRequestToReject ] = useState<string | null>(null);
    const [ reason, setReason ] = useState<string>("");
    const [ requestToAccept, setRequestToAccept ] = useState<TokenizationRequest | null>(null);

    const handleClose = () => setRequestToReject(null);

    const rejectAndCloseModal = async () => {
        await rejectRequest!(requestToReject!, reason);
        setRequestToReject(null);
    };

    const getTokenizationRequest = (requestId: string): (TokenizationRequest | null) => {
        for(let i = 0; i < pendingTokenizationRequests!.length; ++i) {
            const request = pendingTokenizationRequests![i];
            if(request.id === requestId) {
                return request;
            }
        }
        return null;
    }

    if (pendingTokenizationRequests === null) {
        return null;
    }

    return (
        <>
            <Table
                columns={[
                    {
                        header: "Requester",
                        render: request => <Cell content={ request.requesterAddress } />,
                        align: "left",
                    },
                    {
                        header: "Token",
                        render: request => <Cell content={ request.requestedTokenName } />,
                        width: "300px",
                    },
                    {
                        header: "Bars",
                        render: request => <Cell content={ request.bars } />,
                        align: 'right',
                        width: "100px",
                    },
                    {
                        header: "Created",
                        render: request => <DateTimeCell dateTime={ request.createdOn || null } />,
                        width: "150px",
                    },
                    {
                        header: "",
                        render: request => (<>
                            <Button
                                variant="success"
                                onClick={() => setRequestToAccept(getTokenizationRequest(request.id))}
                                data-testid={`accept-${request.id}`}
                            >
                                V
                            </Button>
                            <Button
                                variant="danger"
                                onClick={() => setRequestToReject(request.id)}
                                data-testid={`reject-${request.id}`}
                            >
                                X
                            </Button>
                        </>),
                        width: "200px",
                    }
                ]}
                data={ pendingTokenizationRequests }
                renderEmpty={ () => <EmptyTableMessage>No pending request</EmptyTableMessage> }
            />

            {
                requestToReject !== null &&
                <ProcessStep
                    active={ requestToReject !== null }
                    closeCallback={ handleClose }
                    title={`Rejecting ${requestToReject}`}
                    mayProceed={ true }
                    proceedCallback={ rejectAndCloseModal }
                    stepTestId={`modal-reject-${requestToReject}`}
                    proceedButtonTestId={`confirm-reject-${requestToReject}`}
                >
                    <Form.Group>
                        <Form.Label>Reason</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            onChange={e => setReason(e.target.value)}
                            value={reason}
                            data-testid="reason"
                        />
                    </Form.Group>
                </ProcessStep>
            }

            <TokenizationRequestAcceptance
                requestToAccept={ requestToAccept }
                clearRequestToAccept={ () => setRequestToAccept(null) }
            />
        </>
    );
}
