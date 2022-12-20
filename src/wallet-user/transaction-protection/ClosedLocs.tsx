import { useNavigate } from 'react-router-dom';
import { LocType } from "@logion/node-api/dist/Types.js";

import { useUserContext } from "../UserContext";
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
    locType: LocType
}

export default function ClosedLocs(props: Props) {
    const { locsState } = useUserContext()
    const navigate = useNavigate();
    const { width } = useResponsiveContext();
    const { locType } = props

    if (!locsState || locsState.discarded) {
        return <Loader />;
    }

    return (
        <Table
            columns={[
                {
                    "header": "Legal Officer",
                    render: locData => <LegalOfficerName address={ locData.ownerAddress } />,
                    align: 'left',
                },
                {
                    "header": "Description",
                    render: locData => <Cell content={ locData.description } overflowing tooltipId='description-tooltip' />,
                    align: 'left',
                },
                {
                    header: "Status",
                    render: locData => <LocStatusCell status={ locData.status }/>,
                    width: "140px",
                },
                {
                    header: "LOC ID",
                    render: locData => <LocIdCell status={ locData.status } id={ locData.id }/>,
                    align: "left",
                },
                {
                    "header": "Creation date",
                    render: locData => <DateTimeCell dateTime={ locData.createdOn || null } />,
                    width: width({
                        onSmallScreen: "120px",
                        otherwise: "200px"
                    }),
                    align: 'center',
                },
                {
                    header: "Closing date",
                    render: locData => <DateTimeCell dateTime={ locData.closedOn || null } />,
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
                                <Button onClick={ () => navigate(locDetailsPath(request.id, request.locType)) }>View</Button>
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
            data={ locsState.closedLocs[locType].map(locState => locState.data()) }
            renderEmpty={ () => <EmptyTableMessage>No LOCs</EmptyTableMessage>}
        />
    );
}
