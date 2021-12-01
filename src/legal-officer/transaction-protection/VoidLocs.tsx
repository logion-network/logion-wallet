import { useCommonContext } from '../../common/CommonContext';
import Table, { Cell, EmptyTableMessage, DateTimeCell, ActionCell } from '../../common/Table';
import LocStatusCell from '../../common/LocStatusCell';
import LocIdCell from '../../common/LocIdCell';
import UserIdentityNameCell from '../../common/UserIdentityNameCell';
import Button from "../../common/Button";
import { useNavigate } from "react-router-dom";
import { locDetailsPath } from "../LegalOfficerPaths";
import ButtonGroup from "../../common/ButtonGroup";
import { LocType } from '../../logion-chain/Types';

export interface Props {
    locType: LocType;
}

export default function VoidLocs(props: Props) {
    const { voidTransactionLocs, voidIdentityLocs } = useCommonContext();
    const navigate = useNavigate();

    if (voidTransactionLocs === null || voidIdentityLocs === null) {
        return null;
    }

    let requests = props.locType === 'Transaction' ? voidTransactionLocs : voidIdentityLocs;

    return (
        <Table
            columns={[
                {
                    "header": "Requester",
                    render: request => <UserIdentityNameCell userIdentity={ request.request.userIdentity }/>,
                    align: 'left',
                },
                {
                    "header": "Description",
                    render: request => <Cell content={ request.request.description } />,
                    align: 'left',
                },
                {
                    header: "Status",
                    render: request => <LocStatusCell status={ request.request.status } voidLoc={ true } />,
                    width: "140px",
                },
                {
                    header: "LOC ID",
                    render: request => <LocIdCell status={ request.request.status } id={ request.request.id } />,
                    align: "left",
                },
                {
                    header: "Creation date",
                    render: request => <DateTimeCell dateTime={ request.request.createdOn || null } />,
                    width: '200px',
                    align: 'center',
                },
                {
                    header: "Voiding date",
                    render: request => <DateTimeCell dateTime={ request.request.voidedOn || null } />,
                    width: '200px',
                    align: 'center',
                },
                {
                    header: "Action",
                    render: request =>
                        <ActionCell>
                            <ButtonGroup>
                                <Button onClick={ () => navigate(locDetailsPath(request.request.id)) }>View</Button>
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
