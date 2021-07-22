import React from 'react';

import Table, { Cell, EmptyTableMessage, DateTimeCell } from '../common/Table';

import { useRootContext } from '../RootContext';

import { useLegalOfficerContext } from './LegalOfficerContext';
import { decision } from './Model';
import ProtectionRequestStatus from './ProtectionRequestStatus';
import ProtectionRequestDetails from './ProtectionRequestDetails';

export interface Props {
    recovery: boolean,
}

export default function ProtectionRequestsHistory(props: Props) {
    const { currentAddress } = useRootContext();
    const { protectionRequestsHistory, recoveryRequestsHistory, colorTheme } = useLegalOfficerContext();

    if (protectionRequestsHistory === null || recoveryRequestsHistory === null) {
        return null;
    }

    let requests;
    if(props.recovery) {
        requests = recoveryRequestsHistory;
    } else {
        requests = protectionRequestsHistory;
    }

    return (
        <>
            <Table
                columns={[
                    {
                        header: "First name",
                        render: request => <Cell content={ request.userIdentity.firstName }/>,
                        width: "200px",
                    },
                    {
                        header: "Last name",
                        render: request => <Cell content={ request.userIdentity.lastName }/>,
                        width: "200px",
                        renderDetails: request => <ProtectionRequestDetails request={ request } />,
                    },
                    {
                        header: "Status",
                        render: request => <ProtectionRequestStatus
                            decision={ decision(currentAddress, request.decisions)!.status}
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
                    },
                    {
                        header: "Account to recover",
                        render: request => <Cell content={ request.addressToRecover } overflowing tooltipId={ `src-${request.id}` } />,
                    }
                ]}
                data={ requests }
                colorTheme={ colorTheme }
                renderEmpty={ () => <EmptyTableMessage>No processed request</EmptyTableMessage>}
            />
        </>
    );
}
