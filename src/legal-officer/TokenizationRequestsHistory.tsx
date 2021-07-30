import React from 'react';

import Table, { Cell, DateTimeCell, EmptyTableMessage } from '../common/Table';

import { useLegalOfficerContext } from './LegalOfficerContext';

export default function TokenizationRequestsHistory() {
    const { tokenizationRequestsHistory } = useLegalOfficerContext();

    if(tokenizationRequestsHistory === null) {
        return null;
    }

    return (
        <Table
            columns={[
                {
                    header: "Requester",
                    render: request => <Cell content={ request.requesterAddress }/>,
                    align: "left",
                },
                {
                    header: "Token",
                    render: request => <Cell content={ request.requestedTokenName }/>,
                    width: "300px",
                },
                {
                    header: "Bars",
                    render: request => <Cell content={ request.bars }/>,
                    align: 'right',
                    width: "100px",
                },
                {
                    header: "Timestamp",
                    render: request => <DateTimeCell dateTime={ request.decisionOn || null }/>,
                    width: "150px",
                }
            ]}
            data={ tokenizationRequestsHistory }
            renderEmpty={() => <EmptyTableMessage>No tokenization request history</EmptyTableMessage>}
        />
    );
}
