import { useUserContext } from "../UserContext";
import Table, { Cell, EmptyTableMessage, DateTimeCell, ActionCell } from '../../common/Table';
import LocStatusCell from '../../common/LocStatusCell';
import LocIdCell from '../../common/LocIdCell';
import LegalOfficerName from '../../common/LegalOfficerNameCell';
import ButtonGroup from "../../common/ButtonGroup";
import Button from "../../common/Button";
import Loader from '../../common/Loader';
import { useResponsiveContext } from '../../common/Responsive';
import UserIdentityNameCell from "../../common/UserIdentityNameCell";
import { fullCertificateUrl } from "../../PublicPaths";
import { LocData } from "@logion/client";

export default function VTPClosedLocs() {
    const { locsState } = useUserContext()
    const { width } = useResponsiveContext();

    if(!locsState || locsState.discarded) {
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
                    "header": "Requester",
                    render: locData => <UserIdentityNameCell userIdentity={ locData.userIdentity }/>,
                    align: 'left',
                },
                {
                    "header": "Type",
                    render: locData => <Cell content={ locData.locType }/>,
                    align: 'left',
                    width: "100px",
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
                        otherwise: "140px"
                    }),
                    align: 'center',
                },
                {
                    "header": "Closing date",
                    render: locData => <DateTimeCell dateTime={ locData.closedOn || null } />,
                    width: width({
                        onSmallScreen: "120px",
                        otherwise: "140px"
                    }),
                    align: 'center',
                },
                {
                    header: "Action",
                    render: locData =>
                        <ActionCell>
                            <ButtonGroup>
                                <Button className="ViewCertificateButton" onClick={ () => window.open(fullCertificateUrl(locData.id), "_blank") }>
                                    View
                                </Button>
                            </ButtonGroup>
                        </ActionCell>
                    ,
                    width: width({
                        onSmallScreen: "100px",
                        otherwise: "120px"
                    }),
                    align: 'center',
                },
            ]}
            // TODO Display all Closed LOCs (any type) current user is vtp for.
            data={ [] as LocData[] }
            renderEmpty={ () => <EmptyTableMessage>No LOCs</EmptyTableMessage>}
        />
    );
}
