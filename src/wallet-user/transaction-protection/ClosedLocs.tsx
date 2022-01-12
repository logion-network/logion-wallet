import { useCommonContext } from '../../common/CommonContext';
import Table, { Cell, EmptyTableMessage, DateTimeCell, ActionCell } from '../../common/Table';
import LocStatusCell from '../../common/LocStatusCell';
import LocIdCell from '../../common/LocIdCell';
import LegalOfficerName from '../../common/LegalOfficerNameCell';
import ButtonGroup from "../../common/ButtonGroup";
import Button from "../../common/Button";
import Loader from '../../common/Loader';
import { locDetailsPath } from '../UserRouter';
import { useNavigate } from 'react-router-dom';
import { responsiveWidth } from '../../common/Responsive';

export default function ClosedLocs() {
    const { closedLocRequests } = useCommonContext();
    const navigate = useNavigate();

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
                    width: responsiveWidth({
                        "max-width: 1350px": "120px",
                        default: "200px"
                    }),
                    align: 'center',
                },
                {
                    header: "Closing date",
                    render: requestAndLoc => <DateTimeCell dateTime={ requestAndLoc.request.closedOn || null } />,
                    width: responsiveWidth({
                        "max-width: 1350px": "120px",
                        default: "200px"
                    }),
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
                    width: responsiveWidth({
                        "max-width: 1350px": "100px",
                        default: "200px"
                    }),
                    align: 'center',
                },
            ]}
            data={ closedLocRequests }
            renderEmpty={ () => <EmptyTableMessage>No LOCs</EmptyTableMessage>}
        />
    );
}
