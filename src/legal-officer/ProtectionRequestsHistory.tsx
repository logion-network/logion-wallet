import React from 'react';

import Table, { Cell } from '../component/Table';

import { useRootContext } from '../RootContext';

import { useLegalOfficerContext } from './LegalOfficerContext';
import { decision } from './Model';
import Decision from './Decision';

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
            <h2>History</h2>
            <Table
                columns={[
                    {
                        header: "Requester",
                        render: request => <Cell content={ request.requesterAddress }/>,
                        width: 4,
                    },
                    {
                        header: "Firstname",
                        render: request => <Cell content={ request.userIdentity.firstName }/>,
                        width: 2,
                    },
                    {
                        header: "Lastname",
                        render: request => <Cell content={ request.userIdentity.lastName }/>,
                        width: 2,
                    },
                    {
                        header: "Decision",
                        render: request => <Decision decision={ decision(currentAddress, request.decisions)!.status} />,
                        width: 2,
                    },
                    {
                        header: "Timestamp",
                        render: request => <Cell content={ decision(currentAddress, request.decisions)!.decisionOn } smallText/>,
                        width: 2,
                        smallerText: true,
                    }
                ]}
                data={ requests }
                colorTheme={ colorTheme }
            />
        </>
    );
}
