import { useNavigate } from "react-router-dom";
import { LocType, IdentityLocType } from '@logion/node-api/dist/Types';

import { useCommonContext } from '../../common/CommonContext';
import Table, { Cell, EmptyTableMessage, DateTimeCell, ActionCell } from '../../common/Table';
import LocStatusCell from '../../common/LocStatusCell';
import LocIdCell from '../../common/LocIdCell';
import UserIdentityNameCell from '../../common/UserIdentityNameCell';
import Button from "../../common/Button";
import { locDetailsPath } from "../LegalOfficerPaths";
import ButtonGroup from "../../common/ButtonGroup";
import { useResponsiveContext } from '../../common/Responsive';

export interface Props {
    locType: LocType;
    identityLocType?: IdentityLocType;
}

export default function ClosedLocs(props: Props) {
    const { closedLocRequests, closedIdentityLocsByType } = useCommonContext();
    const navigate = useNavigate();
    const { width } = useResponsiveContext();
    const { locType, identityLocType } = props

    if (closedLocRequests === null || closedIdentityLocsByType === null) {
        return null;
    }

    const requests = locType === 'Identity' ? closedIdentityLocsByType[identityLocType!] : closedLocRequests[locType];

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
                        onSmallScreen: '120px',
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
                    header: "Closing date",
                    render: request => <DateTimeCell dateTime={ request.closedOn || null } />,
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
                                <Button onClick={ () => navigate(locDetailsPath(request.id, request.locType)) }>View</Button>
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
            data={ requests.map(requestAndLoc => requestAndLoc.request) }
            renderEmpty={ () => <EmptyTableMessage>No LOCs</EmptyTableMessage> }
        />
    );
}
