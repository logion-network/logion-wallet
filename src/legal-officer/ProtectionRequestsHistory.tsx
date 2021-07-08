import React from 'react';

import Table, { Cell, EmptyTableMessage } from '../component/Table';

import { useRootContext } from '../RootContext';

import { useLegalOfficerContext } from './LegalOfficerContext';
import { decision } from './Model';
import Decision from './Decision';
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
                        width: 2,
                    },
                    {
                        header: "Last name",
                        render: request => <Cell content={ request.userIdentity.lastName }/>,
                        width: 2,
                        renderDetails: request => <ProtectionRequestDetails request={ request } />,
                    },
                    {
                        header: "Status",
                        render: request => <Decision decision={ decision(currentAddress, request.decisions)!.status} />,
                        width: 2,
                        splitAfter: true,
                    },
                    {
                        header: "Submission date",
                        render: request => <Cell content={ request.createdOn } smallText />,
                        width: 2,
                        smallerText: true,
                    },
                    {
                        header: "Account number",
                        render: request => <Cell content={ request.requesterAddress } smallText wordBreak="break-all" />,
                        width: 2,
                    },
                    {
                        header: "Account to recover",
                        render: request => <Cell content={ request.addressToRecover } smallText wordBreak="break-all" />,
                        width: 2,
                    }
                ]}
                data={ requests }
                colorTheme={ colorTheme }
                renderEmpty={ () => <EmptyTableMessage>No processed request</EmptyTableMessage>}
            />
        </>
    );
}
