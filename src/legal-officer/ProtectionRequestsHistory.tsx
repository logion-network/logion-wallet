import React from 'react';

import Table from '../component/Table';

import { useRootContext } from '../RootContext';

import { useLegalOfficerContext } from './LegalOfficerContext';
import { decision } from './Model';

export interface Props {
    recovery: boolean,
}

export default function ProtectionRequestsHistory(props: Props) {
    const { currentAddress } = useRootContext();
    const { protectionRequestsHistory, recoveryRequestsHistory } = useLegalOfficerContext();

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
                        render: request => request.requesterAddress,
                    },
                    {
                        header: "Firstname",
                        render: request => request.userIdentity.firstName,
                    },
                    {
                        header: "Lastname",
                        render: request => request.userIdentity.lastName,
                    },
                    {
                        header: "Decision",
                        render: request => decision(currentAddress, request.decisions)!.status,
                    },
                    {
                        header: "Timestamp",
                        render: request => decision(currentAddress, request.decisions)!.decisionOn,
                    }
                ]}
                data={ requests }
            />
        </>
    );
}
