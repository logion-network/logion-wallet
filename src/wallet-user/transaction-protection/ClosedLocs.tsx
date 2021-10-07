import React from 'react';

import { useCommonContext } from '../../common/CommonContext';
import Table, { Cell, EmptyTableMessage, DateTimeCell } from '../../common/Table';
import LocStatusCell from '../../common/LocStatusCell';
import LocIdCell from '../../common/LocIdCell';
import LegalOfficerName from '../../common/LegalOfficerNameCell';

export default function ClosedLocs() {
    const { closedLocRequests } = useCommonContext();

    if(closedLocRequests === null) {
        return null;
    }

    return (
        <Table
            columns={[
                {
                    "header": "Legal Officer",
                    render: request => <LegalOfficerName address={ request.ownerAddress } />,
                    align: 'left',
                },
                {
                    "header": "Description",
                    render: request => <Cell content={ request.description } />,
                    align: 'left',
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
                    "header": "Creation date",
                    render: request => <DateTimeCell dateTime={ request.createdOn || null } />,
                    width: '200px',
                    align: 'center',
                },
                {
                    header: "Closing date",
                    render: request => <DateTimeCell dateTime={ request.closedOn || null } />,
                    width: '200px',
                    align: 'center',
                },
            ]}
            data={ closedLocRequests }
            renderEmpty={ () => <EmptyTableMessage>No LOCs</EmptyTableMessage>}
        />
    );
}
