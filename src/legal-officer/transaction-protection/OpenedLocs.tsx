import { useNavigate } from "react-router-dom";
import { LocType, IdentityLocType } from '@logion/node-api';

import { useLegalOfficerContext } from "../LegalOfficerContext";
import Table, { Cell, EmptyTableMessage, DateTimeCell, ActionCell } from '../../common/Table';
import LocStatusCell from '../../common/LocStatusCell';
import LocIdCell from '../../common/LocIdCell';
import UserIdentityNameCell from '../../common/UserIdentityNameCell';
import Button from "../../common/Button";
import { locDetailsPath } from "../LegalOfficerPaths";
import ButtonGroup from "../../common/ButtonGroup";
import { useResponsiveContext } from '../../common/Responsive';
import { Spinner } from "react-bootstrap";

export interface Props {
    locType: LocType;
    identityLocType?: IdentityLocType;
}

export default function OpenedLocs(props: Props) {
    const { openedLocRequests, openedIdentityLocsByType } = useLegalOfficerContext();
    const navigate = useNavigate();
    const { width } = useResponsiveContext();
    const { locType, identityLocType } = props

    if (openedLocRequests === null || openedIdentityLocsByType === null) {
        return <Spinner animation="border"/>;
    }

    const requests = locType === 'Identity' ? openedIdentityLocsByType[identityLocType!] : openedLocRequests[locType];

    return (
        <Table
            columns={[
                {
                    "header": "Requester",
                    render: request => <UserIdentityNameCell userIdentity={ request.userIdentity }/>,
                    align: 'left',
                },
                {
                    "header": "Description",
                    render: request => <Cell content={ request.description } overflowing tooltipId='description-tooltip' />,
                    align: 'left',
                },
                {
                    header: "Status",
                    render: request => <LocStatusCell status={ request.status }/>,
                    width: width({
                        onSmallScreen: '100px',
                        otherwise: '140px'
                    }),
                },
                {
                    header: "LOC ID",
                    render: request => <LocIdCell status={ request.status } id={ request.id } />,
                    align: "left",
                },
                {
                    header: "Creation date",
                    render: request => <DateTimeCell dateTime={ request.createdOn || null } />,
                    width: width({
                        onSmallScreen: '100px',
                        otherwise: '200px'
                    }),
                    align: 'center',
                },
                {
                    header: "Action",
                    render: request =>
                        <ActionCell>
                            <ButtonGroup>
                            <Button onClick={ () => navigate(locDetailsPath(request.id, props.locType)) }>Manage LOC</Button>
                            </ButtonGroup>
                        </ActionCell>
                    ,
                    width: width({
                        onSmallScreen: '150px',
                        otherwise: '200px'
                    }),
                    align: 'center',
                }
            ] }
            data={ requests.map(requestAndLoc => requestAndLoc.data()) }
            renderEmpty={ () => <EmptyTableMessage>No LOCs</EmptyTableMessage> }
        />
    );
}
