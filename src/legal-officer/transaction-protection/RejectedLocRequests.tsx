import { LocType } from "@logion/node-api/dist/Types";

import Table, { Cell, DateTimeCell, EmptyTableMessage } from '../../common/Table';
import LocStatusCell from '../../common/LocStatusCell';
import { useLegalOfficerContext } from "../LegalOfficerContext";
import UserIdentityNameCell from '../../common/UserIdentityNameCell';

import LocRequestDetails from './LocRequestDetails';
import { LocRequest } from "../../common/types/ModelTypes";
import { Child } from "../../common/types/Helpers";
import IdentityLocRequestDetails from "./IdentityLocRequestDetails";

export interface Props {
    locType: LocType;
}

export default function RejectedLocRequests(props: Props) {
    const { rejectedLocRequests } = useLegalOfficerContext();

    if(rejectedLocRequests === null) {
        return null;
    }

    function renderDetails(request: LocRequest): Child {
        if (request.locType === 'Identity') {
            return <IdentityLocRequestDetails request={ request }/>
        } else {
            return <LocRequestDetails request={ request }/>
        }
    }

    return (
        <Table
            columns={[
                {
                    header: "Requester",
                    render: request => <UserIdentityNameCell userIdentity={ request.userIdentity } />,
                    align: "left",
                    renderDetails
                },
                {
                    header: "Description",
                    render: request => <Cell content={ request.description } overflowing tooltipId="description" />,
                    align: "left",
                },
                {
                    header: "Status",
                    render: request => <LocStatusCell status={ request.status }/>,
                    width: "140px",
                },
                {
                    header: "Reason",
                    render: request => <Cell content={ request.rejectReason || "" } overflowing tooltipId="rejectReasonId" />,
                    align: "left",
                },
                {
                    header: "Creation Date",
                    render: request => <DateTimeCell dateTime={ request.createdOn || null } />,
                    width: '200px',
                    align: 'center',
                },
            ]}
            data={ rejectedLocRequests[props.locType] }
            renderEmpty={() => <EmptyTableMessage>No LOC request history</EmptyTableMessage>}
        />
    );
}
