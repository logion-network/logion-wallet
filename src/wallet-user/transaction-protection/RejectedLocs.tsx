import { LocData, RejectedRequest } from "@logion/client";
import { LocType } from "@logion/node-api/dist/Types";
import { useCallback, useMemo, useState } from "react";

import IdentityLocRequestDetails from "../../components/identity/IdentityLocRequestDetails";
import { useUserContext } from "../UserContext";
import Table, { Cell, EmptyTableMessage, DateTimeCell } from '../../common/Table';
import LocStatusCell from '../../common/LocStatusCell';
import LegalOfficerName from '../../common/LegalOfficerNameCell';
import Loader from '../../common/Loader';
import ButtonGroup from "src/common/ButtonGroup";
import Button from "src/common/Button";
import Icon from "src/common/Icon";
import Dialog from "src/common/Dialog";
import { useNavigate } from "react-router-dom";
import { locDetailsPath } from "../UserRouter";

export interface Props {
    locType: LocType
}

export default function RejectedLocs(props: Props) {
    const { locsState, mutateLocsState } = useUserContext();
    const { locType } = props;
    const [ requestToCancel, setRequestToCancel ] = useState<LocData>();
    const navigate = useNavigate();

    const data = useMemo(() =>
        (locsState && !locsState.discarded) ? locsState?.rejectedRequests[locType].map(locState => locState.data()) : []
    , [ locsState, locType ]);

    const cancelRequestCallback = useCallback(async (request: LocData) => {
        await mutateLocsState(async current => {
            const locState = current.findById(request.id);
            if(locState && locState instanceof RejectedRequest) {
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
            if(locState && locState instanceof RejectedRequest) {
                const next = await locState.rework();
                return next.locsState();
            } else {
                return current;
            }
        });
        navigate(locDetailsPath(request.id, request.locType));
    }, [ mutateLocsState, navigate ]);

    if(!locsState || locsState.discarded) {
        return <Loader />;
    }

    return (
        <>
        <Table
            columns={[
                {
                    "header": "Legal officer",
                    render: request => <LegalOfficerName address={ request.ownerAddress } />,
                    renderDetails: locType ==='Identity' ? request => <IdentityLocRequestDetails personalInfo={ request }/> : undefined,
                    align: 'left',
                },
                {
                    "header": "Description",
                    render: request => <Cell content={ request.description } overflowing tooltipId="description" />,
                    align: 'left',
                },
                {
                    header: "Status",
                    render: request => <LocStatusCell status={ request.status }/>,
                    width: "140px",
                },
                {
                    "header": "Reason",
                    render: request => <Cell content={ request.rejectReason || "" } overflowing tooltipId="rejectReasonId"/>,
                    align: 'left',
                },
                {
                    "header": "Creation date",
                    render: request => <DateTimeCell dateTime={ request.createdOn || null } />,
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
                                <Icon icon={{id: "ko"}} height='40px' />
                            </Button>
                            <Button
                                onClick={ () => resubmitRequestCallback(request) }
                                variant="none"
                            >
                                <Icon icon={{id: "ok"}} height='40px' />
                            </Button>
                        </ButtonGroup>
                    ),
                    width: '130px',
                },
            ]}
            data={ data }
            renderEmpty={ () => <EmptyTableMessage>No LOCs</EmptyTableMessage>}
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
            <h3>Cancel rejected { requestToCancel?.locType } LOC request</h3>
            <p>You are about to cancel your request:</p>
            <p>all content will be deleted.</p>
            <p>This action is irreversible.</p>
        </Dialog>
        </>
    );
}
