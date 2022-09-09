import { useState } from 'react';
import Form from 'react-bootstrap/Form';
import { LocType } from "@logion/node-api/dist/Types";

import Table, { Cell, EmptyTableMessage, DateTimeCell } from '../../common/Table';
import LocStatusCell from '../../common/LocStatusCell';
import Button from '../../common/Button';

import { useCommonContext } from '../../common/CommonContext';
import { LocRequest } from '../../common/types/ModelTypes';
import ButtonGroup from "../../common/ButtonGroup";
import UserIdentityNameCell from '../../common/UserIdentityNameCell';

import ProcessStep from '../ProcessStep';
import { rejectLocRequest } from '../../loc/Model';

import LocRequestAcceptance from './LocRequestAcceptance';
import LocRequestDetails from './LocRequestDetails';
import Icon from '../../common/Icon';
import { useLogionChain } from '../../logion-chain';
import { useLegalOfficerContext } from "../LegalOfficerContext";
import { Child } from "../../common/types/Helpers";
import IdentityLocRequestDetails from "./IdentityLocRequestDetails";

export interface Props {
    locType: LocType;
}

export default function PendingLocRequests(props: Props) {
    const { axiosFactory, accounts } = useLogionChain();
    const { refresh } = useCommonContext();
    const { pendingLocRequests, refreshLocs } = useLegalOfficerContext();
    const [ requestToReject, setRequestToReject ] = useState<string | null>(null);
    const [ reason, setReason ] = useState<string>("");
    const [ requestToAccept, setRequestToAccept ] = useState<LocRequest | null>(null);
    const { locType } = props;
    const handleClose = () => setRequestToReject(null);

    if (pendingLocRequests === null || axiosFactory === undefined) {
        return null;
    }

    const rejectAndCloseModal = async () => {
        await rejectLocRequest(axiosFactory(accounts!.current!.address)!, {
            requestId: requestToReject!,
            rejectReason: reason!,
        });
        refresh(false);
        refreshLocs();
        setRequestToReject(null);
    };

    const getLocRequest = (requestId: string): (LocRequest | null) => {
        for(let i = 0; i < pendingLocRequests![locType].length; ++i) {
            const request = pendingLocRequests![locType][i];
            if(request.id === requestId) {
                return request;
            }
        }
        return null;
    }

    function renderDetails(request: LocRequest): Child {
        if (request.locType === 'Identity') {
            return <IdentityLocRequestDetails request={ request }/>
        } else {
            return <LocRequestDetails request={ request }/>
        }
    }

    return (
        <>
            <Table
                columns={[
                    {
                        header: "Requester",
                        render: request => <UserIdentityNameCell userIdentity={ request.userIdentity } />,
                        align: "left",
                        renderDetails
                    },
                    {
                        header: "Description",
                        render: request => <Cell content={ request.description } overflowing tooltipId="description" />,
                        align: "left",
                    },
                    {
                        header: "Status",
                        render: request => <LocStatusCell status={ request.status }/>,
                        width: "140px",
                    },
                    {
                        header: "Creation Date",
                        render: request => <DateTimeCell dateTime={ request.createdOn || null } />,
                        width: '200px',
                        align: 'center',
                    },
                    {
                        header: "",
                        render: request => (
                            <ButtonGroup aria-label="actions">
                                <Button
                                    onClick={() => setRequestToReject(request.id)}
                                    data-testid={`reject-${request.id}`}
                                    variant="none"
                                >
                                    <Icon icon={{id: "ko"}} height='40px' />
                                </Button>
                                <Button
                                    onClick={() => setRequestToAccept(getLocRequest(request.id))}
                                    data-testid={`accept-${request.id}`}
                                    variant="none"
                                >
                                    <Icon icon={{id: "ok"}} height='40px' />
                                </Button>
                            </ButtonGroup>
                        ),
                        width: "200px",
                    }
                ]}
                data={ pendingLocRequests[locType] }
                renderEmpty={ () => <EmptyTableMessage>No pending LOC request</EmptyTableMessage> }
            />

            {
                requestToReject !== null &&
                <ProcessStep
                    active={ requestToReject !== null }
                    title={`Reject LOC request`}
                    nextSteps={[
                        {
                            id: 'cancel',
                            buttonText: 'Cancel',
                            buttonVariant: 'secondary',
                            mayProceed: true,
                            callback: handleClose,
                        },
                        {
                            id: 'reject',
                            buttonText: 'Proceed',
                            buttonVariant: 'primary',
                            mayProceed: true,
                            callback: rejectAndCloseModal,
                        }
                    ]}
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
