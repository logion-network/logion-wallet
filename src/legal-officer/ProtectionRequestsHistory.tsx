import React from 'react';

import Table, { Cell, EmptyTableMessage, DateTimeCell, CopyPasteCell } from '../common/Table';

import { useLegalOfficerContext } from './LegalOfficerContext';
import ProtectionRequestStatus from './ProtectionRequestStatus';
import ProtectionRequestDetails from './ProtectionRequestDetails';
import Button from "../common/Button";
import { identityLocDetailsPath } from "./LegalOfficerPaths";
import { useNavigate } from "react-router-dom";

export default function ProtectionRequestsHistory() {
    const { protectionRequestsHistory } = useLegalOfficerContext();
    const navigate = useNavigate();

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
                        width: "170px",
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
                        render: request => <CopyPasteCell content={ request.requesterAddress } overflowing tooltipId={ `dest-${request.id}` } />,
                        align: 'left',
                    },
                    {
                        header: "Action",
                        render: request => request.decision.locId ? <Button onClick={ () => navigate(identityLocDetailsPath(request.decision.locId!)) }>Identity LOC</Button> : "" ,
                        width: "180px",
                        align: 'center',
                    },
                ]}
                data={ protectionRequestsHistory }
                renderEmpty={ () => <EmptyTableMessage>No processed request</EmptyTableMessage>}
            />
        </>
    );
}
