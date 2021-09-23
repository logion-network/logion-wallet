import React from 'react';

import Table, { Cell, DateTimeCell, EmptyTableMessage } from '../common/Table';
import LocStatusCell from '../common/LocStatusCell';

import { useCommonContext } from '../common/CommonContext';
import LocIdCell from '../common/LocIdCell';

export default function LocRequestsHistory() {
    const { locRequestsHistory } = useCommonContext();

    if(locRequestsHistory === null) {
        return null;
    }

    return (
        <Table
            columns={[
                {
                    header: "Requester",
                    render: request => <Cell content={ request.requesterAddress } overflowing tooltipId="requester-tooltip"/>,
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
                    header: "LOC ID",
                    render: request => <LocIdCell status={ request.status } id={ request.id }/>,
                    align: "left",
                },
                {
                    header: "Created",
                    render: request => <DateTimeCell dateTime={ request.createdOn || null } />,
                    width: "150px",
                },
            ]}
            data={ locRequestsHistory }
            renderEmpty={() => <EmptyTableMessage>No LOC request history</EmptyTableMessage>}
        />
    );
}
