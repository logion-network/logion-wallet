import { useCommonContext } from '../../common/CommonContext';
import Table, { Cell, EmptyTableMessage, DateTimeCell, ActionCell } from '../../common/Table';
import LocStatusCell from '../../common/LocStatusCell';
import LocIdCell from '../../common/LocIdCell';
import UserIdentityNameCell from '../../common/UserIdentityNameCell';
import Button from "../../common/Button";
import { useNavigate } from "react-router-dom";
import { locDetailsPath } from "../LegalOfficerPaths";
import ButtonGroup from "../../common/ButtonGroup";
import { LocType, IdentityLocType } from '../../logion-chain/Types';

export interface Props {
    locType: LocType;
    identityLocType?: IdentityLocType;
}

export default function VoidLocs(props: Props) {
    const { voidTransactionLocs, voidIdentityLocsByType } = useCommonContext();
    const navigate = useNavigate();

    if (voidTransactionLocs === null || voidIdentityLocsByType === null) {
        return null;
    }

    let requests = props.locType === 'Transaction' ? voidTransactionLocs : voidIdentityLocsByType[props.identityLocType!]

    return (
        <Table
            columns={[
                {
                    "header": "Requester",
                    render: requestAndLoc => <UserIdentityNameCell userIdentity={ requestAndLoc.request.userIdentity }/>,
                    align: 'left',
                },
                {
                    "header": "Description",
                    render: requestAndLoc => <Cell content={ requestAndLoc.request.description } overflowing tooltipId='description-tooltip' />,
                    align: 'left',
                },
                {
                    header: "Status",
                    render: requestAndLoc => <LocStatusCell status={ requestAndLoc.request.status } voidLoc={ true } />,
                    width: "140px",
                },
                {
                    header: "LOC ID",
                    render: requestAndLoc => <LocIdCell status={ requestAndLoc.request.status } id={ requestAndLoc.request.id } />,
                    align: "left",
                },
                {
                    header: "Creation date",
                    render: requestAndLoc => <DateTimeCell dateTime={ requestAndLoc.request.createdOn || null } />,
                    width: '200px',
                    align: 'center',
                },
                {
                    header: "Voiding date",
                    render: requestAndLoc => <DateTimeCell dateTime={ requestAndLoc.request.voidInfo?.voidedOn || null } spinner={ true } />,
                    width: '200px',
                    align: 'center',
                },
                {
                    header: "Action",
                    render: requestAndLoc =>
                        <ActionCell>
                            <ButtonGroup>
                                <Button onClick={ () => navigate(locDetailsPath(requestAndLoc.request.id)) }>View</Button>
                            </ButtonGroup>
                        </ActionCell>
                    ,
                    width: '200px',
                    align: 'center',
                }
            ] }
            data={ requests }
            renderEmpty={ () => <EmptyTableMessage>No LOCs</EmptyTableMessage> }
        />
    );
}
