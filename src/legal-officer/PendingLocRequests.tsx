import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';

import Table, { Cell, EmptyTableMessage, DateTimeCell } from '../common/Table';
import LocStatusCell from '../common/LocStatusCell';
import Button from '../common/Button';

import { useCommonContext } from '../common/CommonContext';
import { LocRequest } from '../common/types/ModelTypes';
import ButtonGroup from "../common/ButtonGroup";

import ProcessStep from './ProcessStep';
import LocRequestAcceptance from './LocRequestAcceptance';
import { rejectLocRequest } from './Model';

export default function PendingLocRequests() {
    const { pendingLocRequests, axios, refresh } = useCommonContext();
    const [ requestToReject, setRequestToReject ] = useState<string | null>(null);
    const [ reason, setReason ] = useState<string>("");
    const [ requestToAccept, setRequestToAccept ] = useState<LocRequest | null>(null);

    const handleClose = () => setRequestToReject(null);

    if (pendingLocRequests === null) {
        return null;
    }

    const rejectAndCloseModal = async () => {
        await rejectLocRequest(axios!, {
            requestId: requestToReject!,
            rejectReason: reason!,
        });
        refresh();
        setRequestToReject(null);
    };

    const getLocRequest = (requestId: string): (LocRequest | null) => {
        for(let i = 0; i < pendingLocRequests!.length; ++i) {
            const request = pendingLocRequests![i];
            if(request.id === requestId) {
                return request;
            }
        }
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
                        header: "Description",
                        render: request => <Cell content={ request.description } />,
                        align: "left",
                    },
                    {
                        header: "Status",
                        render: request => <LocStatusCell status={ request.status }/>,
                        width: "140px",
                    },
                    {
                        header: "Created",
                        render: request => <DateTimeCell dateTime={ request.createdOn || null } />,
                        width: "150px",
                    },
                    {
                        header: "",
                        render: request => (
                            <ButtonGroup aria-label="actions">
                                <Button
                                    onClick={() => setRequestToAccept(getLocRequest(request.id))}
                                    data-testid={`accept-${request.id}`}
                                    variant="success"
                                >
                                    V
                                </Button>
                                <Button
                                    onClick={() => setRequestToReject(request.id)}
                                    data-testid={`reject-${request.id}`}
                                    variant="danger"
                                >
                                    X
                                </Button>
                            </ButtonGroup>
                        ),
                        width: "200px",
                    }
                ]}
                data={ pendingLocRequests }
                renderEmpty={ () => <EmptyTableMessage>No pending LOC request</EmptyTableMessage> }
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

            <LocRequestAcceptance
                requestToAccept={ requestToAccept }
                clearRequestToAccept={ () => setRequestToAccept(null) }
            />
        </>
    );
}
