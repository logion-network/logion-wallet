import React from 'react';

import Table, { Cell, EmptyTableMessage, DateCell } from '../common/Table';

import { useUserContext } from './UserContext';

export default function PendingTokenizationRequests() {
    const { pendingTokenizationRequests } = useUserContext();

    if(pendingTokenizationRequests === null) {
        return null;
    }

    return (
        <>
            <Table
                columns={[
                    {
                        header: "Legal officer",
                        render: request => <Cell content={ request.legalOfficerAddress } />,
                        align: 'left',
                    },
                    {
                        header: "Token name",
                        render: request => <Cell content={ request.requestedTokenName } />,
                        align: 'left',
                    },
                    {
                        header: "Bars",
                        render: request => <Cell content={ request.bars } />,
                        align: 'right',
                        width: '200px',
                    },
                    {
                        header: "Creation date",
                        render: request => <DateCell dateTime={ request.createdOn || null } />,
                        width: '200px',
                    }
                ]}
                data={ pendingTokenizationRequests }
                renderEmpty={ () => <EmptyTableMessage>No pending tokenization request</EmptyTableMessage> }
            />
        </>
    );
}
