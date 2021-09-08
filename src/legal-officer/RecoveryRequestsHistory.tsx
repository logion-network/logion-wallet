import React from 'react';

import Table, { Cell, EmptyTableMessage, DateTimeCell } from '../common/Table';

import { useCommonContext } from '../common/CommonContext';

import { useLegalOfficerContext } from './LegalOfficerContext';
import { decision } from './Model';
import ProtectionRequestStatus from './ProtectionRequestStatus';
import ProtectionRequestDetails from './ProtectionRequestDetails';


export default function RecoveryRequestsHistory() {
    const { addresses } = useCommonContext();
    const { recoveryRequestsHistory } = useLegalOfficerContext();

    if (recoveryRequestsHistory === null) {
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
                        render: request => <ProtectionRequestStatus
                            decision={ decision(addresses?.currentAddress?.address, request.decisions)!.status }
                            status={ request.status }
                        />,
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
                        header: "Account to recover",
                        render: request => <Cell content={ request.addressToRecover } overflowing tooltipId={ `src-${request.id}` } />,
                        align: 'left',
                    }
                ]}
                data={ recoveryRequestsHistory }
                renderEmpty={ () => <EmptyTableMessage>No processed request</EmptyTableMessage>}
            />
        </>
    );
}
