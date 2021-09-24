import React from 'react';

import Table, { Cell, DateTimeCell, EmptyTableMessage } from '../../common/Table';
import LocStatusCell from '../../common/LocStatusCell';

import { useCommonContext } from '../../common/CommonContext';
import UserIdentityNameCell from '../../common/UserIdentityNameCell';

export default function LocRequestsHistory() {
    const { rejectedLocRequests } = useCommonContext();

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
            data={ rejectedLocRequests }
            renderEmpty={() => <EmptyTableMessage>No LOC request history</EmptyTableMessage>}
        />
    );
}
