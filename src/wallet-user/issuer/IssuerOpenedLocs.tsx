import { useNavigate } from 'react-router-dom';
import { useUserContext } from "../UserContext";
import Table, { Cell, EmptyTableMessage, DateTimeCell, ActionCell } from '../../common/Table';
import LocStatusCell from '../../common/LocStatusCell';
import LocIdCell from '../../common/LocIdCell';
import LegalOfficerName from '../../common/LegalOfficerNameCell';
import ButtonGroup from "../../common/ButtonGroup";
import Button from "../../common/Button";
import Loader from '../../common/Loader';
import { issuerDetailsPath } from '../UserPaths';
import { useResponsiveContext } from '../../common/Responsive';
import UserIdentityNameCell from "../../common/UserIdentityNameCell";
import { LocData } from "@logion/client";
import { useMemo } from "react";
import { merge } from "./IssuerUtils";

export default function IssuerOpenedLocs() {
    const { locsState } = useUserContext()
    const navigate = useNavigate();
    const { width } = useResponsiveContext();

    const data: LocData[] = useMemo(
        () => merge(locsState?.openVerifiedIssuerLocs),
        [ locsState ]
    );

    if (!locsState || locsState.discarded) {
        return <Loader />;
    }

    return (
        <Table
            columns={ [
                {
                    "header": "Legal Officer",
                    render: locData => <LegalOfficerName address={ locData.ownerAccountId } />,
                    align: 'left',
                },
                {
                    "header": "Requester",
                    render: locData => <UserIdentityNameCell userIdentity={ locData.userIdentity } />,
                    align: 'left',
                },
                {
                    "header": "Type",
                    render: locData => <Cell content={ locData.locType } />,
                    align: 'left',
                    width: "110px",
                },
                {
                    "header": "Description",
                    render: locData => <Cell content={ locData.description } overflowing
                                             tooltipId='description-tooltip' />,
                    align: 'left',
                },
                {
                    header: "Status",
                    render: locData => <LocStatusCell status={ locData.status } />,
                    width: "140px",
                },
                {
                    header: "LOC ID",
                    render: locData => <LocIdCell status={ locData.status } id={ locData.id } />,
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
                    header: "Action",
                    render: locData =>
                        <ActionCell>
                            <ButtonGroup>
                                <Button
                                    onClick={ () => navigate(issuerDetailsPath(locData.id)) }>Contribute</Button>
                            </ButtonGroup>
                        </ActionCell>
                    ,
                    width: width({
                        onSmallScreen: "140px",
                        otherwise: "160px"
                    }),
                    align: 'center',
                },
            ] }
            data={ data }
            renderEmpty={ () => <EmptyTableMessage>No LOCs</EmptyTableMessage> }
        />
    );
}
