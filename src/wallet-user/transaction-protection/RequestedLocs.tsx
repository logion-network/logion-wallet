import { DataLocType } from "logion-api/dist/Types";

import { useCommonContext } from '../../common/CommonContext';
import Table, { Cell, EmptyTableMessage, DateTimeCell } from '../../common/Table';
import LocStatusCell from '../../common/LocStatusCell';
import LegalOfficerName from '../../common/LegalOfficerNameCell';
import Loader from '../../common/Loader';

export interface Props {
    locType: DataLocType
}

export default function RequestedLocs(props: Props) {
    const { pendingLocRequests } = useCommonContext();
    const { locType } = props

    if(pendingLocRequests === null) {
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
            data={ pendingLocRequests[locType] }
            renderEmpty={ () => <EmptyTableMessage>No requested LOCs</EmptyTableMessage> }
        />
    );
}
