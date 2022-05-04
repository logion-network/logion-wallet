import { useNavigate } from 'react-router-dom';
import { DataLocType } from "logion-api/dist/Types";

import { useCommonContext } from '../../common/CommonContext';
import Table, { Cell, EmptyTableMessage, DateTimeCell, ActionCell } from '../../common/Table';
import LocStatusCell from '../../common/LocStatusCell';
import LocIdCell from '../../common/LocIdCell';
import LegalOfficerName from '../../common/LegalOfficerNameCell';
import ButtonGroup from "../../common/ButtonGroup";
import Button from "../../common/Button";
import Loader from '../../common/Loader';
import { locDetailsPath } from '../UserRouter';
import { useResponsiveContext } from '../../common/Responsive';

export interface Props {
    locType: DataLocType
}

export default function ClosedLocs(props: Props) {
    const { closedLocRequests } = useCommonContext();
    const navigate = useNavigate();
    const { width } = useResponsiveContext();
    const { locType } = props

    if(closedLocRequests === null) {
        return <Loader />;
    }

    return (
        <Table
            columns={[
                {
                    "header": "Legal Officer",
                    render: requestAndLoc => <LegalOfficerName address={ requestAndLoc.request.ownerAddress } />,
                    align: 'left',
                },
                {
                    "header": "Description",
                    render: requestAndLoc => <Cell content={ requestAndLoc.request.description } overflowing tooltipId='description-tooltip' />,
                    align: 'left',
                },
                {
                    header: "Status",
                    render: requestAndLoc => <LocStatusCell status={ requestAndLoc.request.status }/>,
                    width: "140px",
                },
                {
                    header: "LOC ID",
                    render: requestAndLoc => <LocIdCell status={ requestAndLoc.request.status } id={ requestAndLoc.request.id }/>,
                    align: "left",
                },
                {
                    "header": "Creation date",
                    render: requestAndLoc => <DateTimeCell dateTime={ requestAndLoc.request.createdOn || null } />,
                    width: width({
                        onSmallScreen: "120px",
                        otherwise: "200px"
                    }),
                    align: 'center',
                },
                {
                    header: "Closing date",
                    render: requestAndLoc => <DateTimeCell dateTime={ requestAndLoc.request.closedOn || null } />,
                    width: width({
                        onSmallScreen: "120px",
                        otherwise: "200px"
                    }),
                    align: 'center',
                },
                {
                    header: "Action",
                    render: request =>
                        <ActionCell>
                            <ButtonGroup>
                                <Button onClick={ () => navigate(locDetailsPath(request.request.id, request.request.locType)) }>View</Button>
                            </ButtonGroup>
                        </ActionCell>
                    ,
                    width: width({
                        onSmallScreen: "100px",
                        otherwise: "200px"
                    }),
                    align: 'center',
                },
            ]}
            data={ closedLocRequests[locType] }
            renderEmpty={ () => <EmptyTableMessage>No LOCs</EmptyTableMessage>}
        />
    );
}
