import { DataLocType } from "@logion/node-api/dist/Types";

import { useUserContext } from "../UserContext";
import Table, { Cell, EmptyTableMessage, DateTimeCell } from '../../common/Table';
import LocStatusCell from '../../common/LocStatusCell';
import LegalOfficerName from '../../common/LegalOfficerNameCell';
import Loader from '../../common/Loader';

export interface Props {
    locType: DataLocType
}

export default function RequestedLocs(props: Props) {
    const { locsState } = useUserContext()
    const { locType } = props

    if(locsState === null || locsState?.pendingRequests === undefined) {
        return <Loader />;
    }

    return (
        <Table
            columns={[
                {
                    header: "Legal officer",
                    render: request => <LegalOfficerName address={ request.ownerAddress } />,
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
                    header: "Creation date",
                    render: request => <DateTimeCell dateTime={ request.createdOn || null } />,
                    width: '200px',
                    align: 'center',
                }
            ]}
            data={ locsState.pendingRequests[locType].map(locState => locState.data()) }
            renderEmpty={ () => <EmptyTableMessage>No requested LOCs</EmptyTableMessage> }
        />
    );
}
