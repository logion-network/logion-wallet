import { useNavigate } from 'react-router-dom';
import { DataLocType } from "@logion/node-api/dist/Types";

import { useCommonContext } from '../../common/CommonContext';
import Table, { Cell, EmptyTableMessage, DateTimeCell, ActionCell } from '../../common/Table';
import LocStatusCell from '../../common/LocStatusCell';
import LocIdCell from '../../common/LocIdCell';
import LegalOfficerName from '../../common/LegalOfficerNameCell';
import ButtonGroup from "../../common/ButtonGroup";
import Button from "../../common/Button";
import Loader from '../../common/Loader';
import { useResponsiveContext } from '../../common/Responsive';

import { locDetailsPath } from '../UserRouter';

export interface Props {
    locType: DataLocType
}

export default function VoidLocs(props: Props) {
    const { voidTransactionLocs } = useCommonContext();
    const navigate = useNavigate();
    const { width } = useResponsiveContext();
    const { locType } = props

    if (voidTransactionLocs === null) {
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
                    render: requestAndLoc => <LocStatusCell status={ requestAndLoc.request.status } voidLoc={true} />,
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
                    header: "Voiding date",
                    render: requestAndLoc => <DateTimeCell dateTime={ requestAndLoc.request.voidInfo?.voidedOn || null } />,
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
            data={ voidTransactionLocs[locType] }
            renderEmpty={ () => <EmptyTableMessage>No LOCs</EmptyTableMessage>}
        />
    );
}
