import { LocType } from "@logion/node-api";

import Table, { Cell, EmptyTableMessage, DateTimeCell } from '../../common/Table';
import LocStatusCell from '../../common/LocStatusCell';
import Button from '../../common/Button';

import ButtonGroup from "../../common/ButtonGroup";
import UserIdentityNameCell from '../../common/UserIdentityNameCell';

import LocRequestDetails from './LocRequestDetails';
import { useLegalOfficerContext } from "../LegalOfficerContext";
import { useResponsiveContext } from "../../common/Responsive";
import { locDetailsPath } from "../LegalOfficerPaths";
import { useNavigate } from 'react-router-dom';
import { useMemo } from "react";

export interface Props {
    locType: LocType;
}

export default function PendingLocRequests(props: Props) {
    const { pendingLocRequests } = useLegalOfficerContext();
    const { locType } = props;
    const { width } = useResponsiveContext();
    const navigate = useNavigate();

    const data = useMemo(() => pendingLocRequests ? pendingLocRequests[locType].map(loc => loc.data()) : [], [ pendingLocRequests, locType ]);

    if (pendingLocRequests === null) {
        return null;
    }

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
                                    onClick={ () => navigate(locDetailsPath(request.id, request.locType)) }
                                >
                                    Review
                                </Button>
                            </ButtonGroup>
                        ),
                        width: "150px",
                    }
                ]}
                data={ data }
                renderEmpty={ () => <EmptyTableMessage>No pending LOC request</EmptyTableMessage> }
            />
        </>
    );
}
