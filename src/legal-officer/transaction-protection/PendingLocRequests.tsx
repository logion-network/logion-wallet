import { useState } from 'react';
import Form from 'react-bootstrap/Form';
import { LocType } from "@logion/node-api/dist/Types";
import { LocRequest } from "@logion/client";

import Table, { Cell, EmptyTableMessage, DateTimeCell } from '../../common/Table';
import LocStatusCell from '../../common/LocStatusCell';
import Button from '../../common/Button';

import { useCommonContext } from '../../common/CommonContext';
import ButtonGroup from "../../common/ButtonGroup";
import UserIdentityNameCell from '../../common/UserIdentityNameCell';

import ProcessStep from '../ProcessStep';
import { rejectLocRequest } from '../../loc/Model';

import LocRequestAcceptance from './LocRequestAcceptance';
import LocRequestDetails from './LocRequestDetails';
import Icon from '../../common/Icon';
import { useLogionChain } from '../../logion-chain';
import { useLegalOfficerContext } from "../LegalOfficerContext";
import { useResponsiveContext } from "../../common/Responsive";
import { useNavigate } from "react-router-dom";
import { identityLocDetailsPath } from "../LegalOfficerPaths";

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
    const { width } = useResponsiveContext();
    const navigate = useNavigate();

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

    return (
        <>
            <Table
                columns={[
                    {
                        header: "Requester",
                        render: request => <UserIdentityNameCell userIdentity={ request.userIdentity } />,
                        align: "left",
                        renderDetails: request => <LocRequestDetails request={ request }/>
                    },
                    {
                        header: "Description",
                        render: request => <Cell content={ request.description } overflowing tooltipId="description" />,
                        align: "left",
                    },
                    {
                        header: "Status",
                        render: request => <LocStatusCell status={ request.status }/>,
                        width: width({
                            onSmallScreen: locType === "Identity" ? "140px" : "130px",
                            otherwise: "140px",
                        }),
                    },
                    {
                        header: "Creation Date",
                        render: request => <DateTimeCell dateTime={ request.createdOn || null } />,
                        width: width({
                            onSmallScreen: locType === "Identity" ? "200px" : "130",
                            otherwise: "200px",
                        }),
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
                                    onClick={() => setRequestToAccept(request)}
                                    data-testid={`accept-${request.id}`}
                                    variant="none"
                                >
                                    <Icon icon={{id: "ok"}} height='40px' />
                                </Button>
                                { locType !== "Identity" && request.identityLoc &&
                                    <Button
                                        onClick={ () => navigate(identityLocDetailsPath(request.identityLoc!)) }
                                    >
                                        Identity LOC
                                    </Button>
                                }
                            </ButtonGroup>
                        ),
                        width: width({
                            onSmallScreen: locType === "Identity" ? "200px" : "280px",
                            otherwise: locType === "Identity" ? "200px" : "320px",
                        }),
                    }
                ]}
                data={ pendingLocRequests[locType] }
                renderEmpty={ () => <EmptyTableMessage>No pending LOC request</EmptyTableMessage> }
            />

            {
                requestToReject !== null &&
                <ProcessStep
                    active={ true }
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
