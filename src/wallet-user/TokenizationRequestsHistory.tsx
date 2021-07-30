import React from 'react';

import Table, { Cell, EmptyTableMessage, DateCell } from '../common/Table';

import { useUserContext } from './UserContext';

export default function TokenizationRequestsHistory() {
    const { tokenizationRequestsHistory } = useUserContext();

    if(tokenizationRequestsHistory === null) {
        return null;
    }

    return (
        <Table
            columns={[
                {
                    "header": "Legal officer",
                    render: request => <Cell content={ request.legalOfficerAddress } />,
                    align: 'left',
                },
                {
                    "header": "Token name",
                    render: request => <Cell content={ request.requestedTokenName } />,
                    align: 'left',
                },
                {
                    "header": "Bars",
                    render: request => <Cell content={ request.bars } />,
                    align: 'right',
                    width: '200px',
                },
                {
                    "header": "Timestamp",
                    render: request => <DateCell dateTime={ request.createdOn || null } />,
                    align: 'left',
                    width: '200px',
                },
            ]}
            data={ tokenizationRequestsHistory }
            renderEmpty={ () => <EmptyTableMessage>No tokenization request history</EmptyTableMessage>}
        />
    );
}
