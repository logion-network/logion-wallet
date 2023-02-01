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
import { useMemo } from "react";

export interface Props {
    locType: LocType;
    identityLocType?: IdentityLocType;
}

export default function VoidLocs(props: Props) {
    const { voidTransactionLocs, voidIdentityLocsByType } = useLegalOfficerContext();
    const navigate = useNavigate();
    const { width } = useResponsiveContext();
    const { locType, identityLocType } = props;

    const data = useMemo(() => {
        if(locType === 'Identity' && voidIdentityLocsByType && identityLocType) {
            return voidIdentityLocsByType[identityLocType].map(state => state.data());
        } else if(voidTransactionLocs) {
            return voidTransactionLocs[locType].map(state => state.data());
        } else {
            return [];
        }
    }, [ voidIdentityLocsByType, voidTransactionLocs, locType, identityLocType ]);

    if (voidTransactionLocs === null || voidIdentityLocsByType === null) {
        return null;
    }

    return (
        <Table
            columns={[
                {
                    "header": "Requester",
                    render: requestAndLoc => <UserIdentityNameCell userIdentity={ requestAndLoc.userIdentity }/>,
                    align: 'left',
                },
                {
                    "header": "Description",
                    render: requestAndLoc => <Cell content={ requestAndLoc.description } overflowing tooltipId='description-tooltip' />,
                    align: 'left',
                },
                {
                    header: "Status",
                    render: requestAndLoc => <LocStatusCell status={ requestAndLoc.status } voidLoc={ true } />,
                    width: width({
                        onSmallScreen: '100px',
                        otherwise: '140px'
                    }),
                },
                {
                    header: "LOC ID",
                    render: requestAndLoc => <LocIdCell status={ requestAndLoc.status } id={ requestAndLoc.id } />,
                    align: "left",
                },
                {
                    header: "Creation date",
                    render: requestAndLoc => <DateTimeCell dateTime={ requestAndLoc.createdOn || null } />,
                    width: width({
                        onSmallScreen: '100px',
                        otherwise: '200px'
                    }),
                    align: 'center',
                },
                {
                    header: "Voiding date",
                    render: requestAndLoc => <DateTimeCell dateTime={ requestAndLoc.voidInfo?.voidedOn || null } spinner={ true } />,
                    width: width({
                        onSmallScreen: '100px',
                        otherwise: '200px'
                    }),
                    align: 'center',
                },
                {
                    header: "Action",
                    render: requestAndLoc =>
                        <ActionCell>
                            <ButtonGroup>
                                <Button onClick={ () => navigate(locDetailsPath(requestAndLoc.id, props.locType)) }>View</Button>
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
            data={ data }
            renderEmpty={ () => <EmptyTableMessage>No LOCs</EmptyTableMessage> }
        />
    );
}
