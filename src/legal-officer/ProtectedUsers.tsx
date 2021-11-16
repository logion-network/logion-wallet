import { useLegalOfficerContext } from "./LegalOfficerContext";
import Table, { Cell, EmptyTableMessage } from '../common/Table';
import LegalOfficerName from '../common/LegalOfficerNameCell';
import ProtectedUserDetails from "./ProtectedUserDetails";
import Button from "../common/Button";
import { locDetailsPath } from "./LegalOfficerPaths";
import React from "react";
import { useNavigate } from "react-router-dom";

export default function ProtectedUsers() {
    const { activatedProtectionRequests } = useLegalOfficerContext();
    const navigate = useNavigate();

    if(activatedProtectionRequests === null) {
        return null;
    }

    return (
        <Table
            columns={[
                {
                    header: "User",
                    render: request => <Cell content={ `${request.userIdentity.firstName} ${request.userIdentity.lastName}` }/>,
                    align: 'left',
                    width: "50%",
                    renderDetails: request => <ProtectedUserDetails request={ request } />,
                },
                {
                    header: "Other Legal Officer",
                    render: request => <LegalOfficerName address={ request.otherLegalOfficerAddress }/>,
                    width: "50%",
                    align: 'left',
                },
                {
                    header: "Action",
                    render: request => <Button onClick={ () => navigate(locDetailsPath(request.decision.locId!)) }>Identity LOC</Button>,
                    width: "200px",
                    align: 'center',
                },
            ]}
            data={ activatedProtectionRequests }
            renderEmpty={ () => <EmptyTableMessage>No user to display</EmptyTableMessage> }
        />
    );
}
