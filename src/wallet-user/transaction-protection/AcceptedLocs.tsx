import { LocData, AcceptedRequest } from "@logion/client";
import { LocType } from "@logion/node-api";
import { useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import IdentityLocRequestDetails from "../../components/identity/IdentityLocRequestDetails";
import { useUserContext } from "../UserContext";
import Table, { Cell, EmptyTableMessage, DateTimeCell } from '../../common/Table';
import LocStatusCell from '../../common/LocStatusCell';
import LegalOfficerName from '../../common/LegalOfficerNameCell';
import Loader from '../../common/Loader';
import ButtonGroup from "src/common/ButtonGroup";
import Button from "src/common/Button";
import { locDetailsPath } from "../UserRouter";
import Icon from "../../common/Icon";
import Dialog from "../../common/Dialog";

export interface Props {
    locType: LocType
}

export default function AcceptedLocs(props: Props) {
    const { locsState, mutateLocsState } = useUserContext();
    const { locType } = props;
    const [ requestToCancel, setRequestToCancel ] = useState<LocData>();
    const navigate = useNavigate();

    const data = useMemo(() =>
            (locsState && !locsState.discarded) ? locsState.acceptedRequests[locType].map(locState => locState.data()) : []
        , [ locsState, locType ]);

    const cancelRequestCallback = useCallback(async (request: LocData) => {
        await mutateLocsState(async current => {
            const locState = current.findById(request.id);
            if (locState && locState instanceof AcceptedRequest) {
                return locState.cancel();
            } else {
                return current;
            }
        });
        setRequestToCancel(undefined);
    }, [ mutateLocsState ]);

    const resubmitRequestCallback = useCallback(async (request: LocData) => {
        await mutateLocsState(async current => {
            const locState = current.findById(request.id);
            if (locState && locState instanceof AcceptedRequest) {
                return (await locState.rework()).locsState();
            } else {
                return current;
            }
        });
        navigate(locDetailsPath(request.id, request.locType));
    }, [ mutateLocsState, navigate ]);

    if (!locsState || locsState.discarded) {
        return <Loader />;
    }

    return (
        <>
            <Table
                columns={ [
                    {
                        header: "Legal officer",
                        render: locData => <LegalOfficerName address={ locData.ownerAddress } />,
                        renderDetails: locType === 'Identity' ? locData => <IdentityLocRequestDetails
                            personalInfo={ locData } /> : undefined,
                        align: 'left',
                    },
                    {
                        header: "Description",
                        render: locData => <Cell content={ locData.description } overflowing tooltipId="description" />,
                        align: 'left',
                    },
                    {
                        header: "Status",
                        render: locData => <LocStatusCell status={ locData.status } />,
                        width: "140px",
                    },
                    {
                        header: "Creation date",
                        render: locData => <DateTimeCell dateTime={ locData.createdOn || null } />,
                        width: '200px',
                        align: 'center',
                    },
                    {
                        header: "Re-open as draft?",
                        render: request => (
                            <ButtonGroup aria-label="actions">
                                <Button
                                    onClick={ () => setRequestToCancel(request) }
                                    variant="none"
                                >
                                    <Icon icon={ { id: "ko" } } height='40px' />
                                </Button>
                                <Button
                                    onClick={ () => resubmitRequestCallback(request) }
                                    variant="none"
                                >
                                    <Icon icon={ { id: "ok" } } height='40px' />
                                </Button>
                            </ButtonGroup>
                        ),
                        width: '130px',
                    },
                    {
                        header: "Action",
                        render: locData => (
                            <ButtonGroup>
                                <Button
                                    onClick={ () => navigate(locDetailsPath(locData.id, locData.locType)) }
                                >
                                    Open
                                </Button>
                            </ButtonGroup>
                        ),
                        width: '150px',
                    }
                ] }
                data={ data }
                renderEmpty={ () => <EmptyTableMessage>No accepted request</EmptyTableMessage> }
            />
            <Dialog
                show={ requestToCancel !== undefined }
                size="lg"
                actions={[
                    {
                        id: "cancel",
                        buttonText: "Cancel",
                        buttonVariant: "secondary",
                        callback: () => setRequestToCancel(undefined),
                    },
                    {
                        id: "proceed",
                        buttonText: "Proceed",
                        buttonVariant: "primary",
                        callback: () => cancelRequestCallback(requestToCancel!),
                    },
                ]}
            >
                <h3>Cancel accepted { requestToCancel?.locType } LOC request</h3>
                <p>You are about to cancel your request:</p>
                <p>all content will be deleted.</p>
                <p>This action is irreversible.</p>
            </Dialog>
        </>
    );
}
