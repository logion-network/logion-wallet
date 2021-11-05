import React from 'react';

import Table, { Cell, EmptyTableMessage, DateTimeCell } from '../common/Table';

import { useLegalOfficerContext } from './LegalOfficerContext';
import ProtectionRequestStatus from './ProtectionRequestStatus';
import ProtectionRequestDetails from './ProtectionRequestDetails';
import { UUID } from '../logion-chain/UUID';

export default function ProtectionRequestsHistory() {
    const { protectionRequestsHistory } = useLegalOfficerContext();

    if (protectionRequestsHistory === null) {
        return null;
    }

    return (
        <>
            <Table
                columns={[
                    {
                        header: "First name",
                        render: request => <Cell content={ request.userIdentity.firstName }/>,
                        width: "200px",
                        align: 'left',
                    },
                    {
                        header: "Last name",
                        render: request => <Cell content={ request.userIdentity.lastName }/>,
                        width: "200px",
                        renderDetails: request => <ProtectionRequestDetails request={ request } />,
                        align: 'left',
                    },
                    {
                        header: "Status",
                        render: request => <ProtectionRequestStatus status={ request.status } />,
                        width: "140px",
                        splitAfter: true,
                    },
                    {
                        header: "Submission date",
                        render: request => <DateTimeCell dateTime={ request.createdOn } />,
                        width: "120px",
                        smallerText: true,
                    },
                    {
                        header: "Account number",
                        render: request => <Cell content={ request.requesterAddress } overflowing tooltipId={ `dest-${request.id}` } />,
                        align: 'left',
                    },
                    {
                        header: "Identity LOC",
                        render: request => <Cell content={ request.decision.locId !== undefined ? new UUID(request.decision.locId!).toDecimalString() : "-" } />,
                        align: 'left',
                    },
                ]}
                data={ protectionRequestsHistory }
                renderEmpty={ () => <EmptyTableMessage>No processed request</EmptyTableMessage>}
            />
        </>
    );
}
