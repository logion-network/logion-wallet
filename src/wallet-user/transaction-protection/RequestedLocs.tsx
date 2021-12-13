import React from 'react';

import { useCommonContext } from '../../common/CommonContext';
import Table, { Cell, EmptyTableMessage, DateTimeCell } from '../../common/Table';
import LocStatusCell from '../../common/LocStatusCell';
import LegalOfficerName from '../../common/LegalOfficerNameCell';
import Loader from '../../common/Loader';

export default function RequestedLocs() {
    const { pendingLocRequests } = useCommonContext();

    if(pendingLocRequests === null) {
        return <Loader />;
    }

    return (
        <Table
            columns={[
                {
                    header: "Legal officer",
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
                    header: "Creation date",
                    render: request => <DateTimeCell dateTime={ request.createdOn || null } />,
                    width: '200px',
                    align: 'center',
                }
            ]}
            data={ pendingLocRequests }
            renderEmpty={ () => <EmptyTableMessage>No requested LOCs</EmptyTableMessage> }
        />
    );
}
