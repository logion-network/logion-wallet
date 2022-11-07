import { LocType } from "@logion/node-api/dist/Types";
import { useMemo } from "react";

import IdentityLocRequestDetails from "../../components/identity/IdentityLocRequestDetails";
import { useUserContext } from "../UserContext";
import Table, { Cell, EmptyTableMessage, DateTimeCell } from '../../common/Table';
import LocStatusCell from '../../common/LocStatusCell';
import LegalOfficerName from '../../common/LegalOfficerNameCell';
import Loader from '../../common/Loader';

export interface Props {
    locType: LocType
}

export default function RejectedLocs(props: Props) {
    const { locsState } = useUserContext()
    const { locType } = props

    const data = useMemo(() =>
        (locsState && !locsState.discarded) ? locsState?.rejectedRequests[locType].map(locState => locState.data()) : []
    , [ locsState, locType ]);

    if(!locsState || locsState.discarded) {
        return <Loader />;
    }

    return (
        <Table
            columns={[
                {
                    "header": "Legal officer",
                    render: request => <LegalOfficerName address={ request.ownerAddress } />,
                    renderDetails: locType ==='Identity' ? request => <IdentityLocRequestDetails personalInfo={ request }/> : undefined,
                    align: 'left',
                },
                {
                    "header": "Description",
                    render: request => <Cell content={ request.description } overflowing tooltipId="description" />,
                    align: 'left',
                },
                {
                    header: "Status",
                    render: request => <LocStatusCell status={ request.status }/>,
                    width: "140px",
                },
                {
                    "header": "Reason",
                    render: request => <Cell content={ request.rejectReason || "" } overflowing tooltipId="rejectReasonId"/>,
                    align: 'left',
                },
                {
                    "header": "Creation date",
                    render: request => <DateTimeCell dateTime={ request.createdOn || null } />,
                    width: '200px',
                    align: 'center',
                },
            ]}
            data={ data }
            renderEmpty={ () => <EmptyTableMessage>No LOCs</EmptyTableMessage>}
        />
    );
}
