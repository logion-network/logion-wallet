import { LocType } from "@logion/node-api/dist/Types.js";

import Table, { Cell, DateTimeCell, EmptyTableMessage } from '../../common/Table';
import LocStatusCell from '../../common/LocStatusCell';
import { useLegalOfficerContext } from "../LegalOfficerContext";
import UserIdentityNameCell from '../../common/UserIdentityNameCell';

import LocRequestDetails from './LocRequestDetails';
import { useMemo } from "react";

export interface Props {
    locType: LocType;
}

export default function RejectedLocRequests(props: Props) {
    const { rejectedLocRequests } = useLegalOfficerContext();
    const { locType } = props;

    const data = useMemo(() => rejectedLocRequests ? rejectedLocRequests[locType].map(loc => loc.data()) : [], [ rejectedLocRequests, locType ]);

    if(rejectedLocRequests === null) {
        return null;
    }

    return (
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
                    width: "140px",
                },
                {
                    header: "Reason",
                    render: request => <Cell content={ request.rejectReason || "" } overflowing tooltipId="rejectReasonId" />,
                    align: "left",
                },
                {
                    header: "Creation Date",
                    render: request => <DateTimeCell dateTime={ request.createdOn || null } />,
                    width: '200px',
                    align: 'center',
                },
            ]}
            data={ data }
            renderEmpty={() => <EmptyTableMessage>No LOC request history</EmptyTableMessage>}
        />
    );
}
