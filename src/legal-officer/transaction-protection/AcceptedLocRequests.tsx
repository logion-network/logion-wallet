import { LocType } from "@logion/node-api";
import Table, { Cell, EmptyTableMessage, DateTimeCell } from '../../common/Table';
import LocStatusCell from '../../common/LocStatusCell';
import UserIdentityNameCell from '../../common/UserIdentityNameCell';
import LocRequestDetails from './LocRequestDetails';
import { useLegalOfficerContext } from "../LegalOfficerContext";
import { useResponsiveContext } from "../../common/Responsive";
import { useNavigate } from 'react-router-dom';
import { useMemo } from "react";
import { Spinner } from "react-bootstrap";

export interface Props {
    locType: LocType;
}

export default function AcceptedLocRequests(props: Props) {
    const { acceptedLocRequests } = useLegalOfficerContext();
    const { locType } = props;
    const { width } = useResponsiveContext();
    const navigate = useNavigate();

    const data = useMemo(
        () => acceptedLocRequests ? acceptedLocRequests[locType].map(loc => loc.data()) : [],
        [ acceptedLocRequests, locType ]
    );

    if (acceptedLocRequests === null) {
        return <Spinner animation="border"/>;
    }

    return (
        <>
            <Table
                columns={[
                    {
                        header: "Requester",
                        render: request => <UserIdentityNameCell userIdentity={ request.userIdentity } />,
                        align: "left",
                        renderDetails: request => <LocRequestDetails request={ request }/>
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
                        header: "Creation Date",
                        render: request => <DateTimeCell dateTime={ request.createdOn || null } />,
                        width: '200px',
                        align: 'center',
                    }
                ]}
                data={ data }
                renderEmpty={ () => <EmptyTableMessage>No accepted LOC request</EmptyTableMessage> }
            />
        </>
    );
}
