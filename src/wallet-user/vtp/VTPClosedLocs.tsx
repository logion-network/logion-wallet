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
import { useMemo } from "react";
import { merge } from "./VTPUtils";
import Icon from "src/common/Icon";
import "./VTPClosedLocs.css";
import { useNavigate } from "react-router-dom";
import { vtpTokensRecordPath } from "../UserRouter";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

export default function VTPClosedLocs() {
    const { locsState } = useUserContext()
    const { width } = useResponsiveContext();
    const navigate = useNavigate();

    const data: LocData[] = useMemo(
        () => merge(locsState?.closedVerifiedThirdPartyLocs),
        [ locsState ]
    );

    if (!locsState || locsState.discarded) {
        return <Loader />;
    }

    return (
        <div className="VTPClosedLocs">
            <Table
                columns={ [
                    {
                        "header": "Legal Officer",
                        render: locData => <LegalOfficerName address={ locData.ownerAddress } />,
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
                                    {
                                        locData.locType !== "Collection" &&
                                        <OverlayTrigger
                                            placement="bottom"
                                            delay={ 500 }
                                            overlay={
                                                <Tooltip id={`tooltip-${locData.id}-view-certificate`}>
                                                    Certificate
                                                </Tooltip>
                                            }
                                        >
                                            <div>
                                                <Button
                                                    className="view-certificate"
                                                    onClick={ () => window.open(fullCertificateUrl(locData.id), "_blank") }
                                                >
                                                    
                                                    <Icon icon={{id: "view-certificate"}} height="24px"/>
                                                </Button>
                                            </div>
                                        </OverlayTrigger>
                                    }
                                    {
                                        locData.locType === "Collection" &&
                                        <OverlayTrigger
                                            placement="bottom"
                                            delay={ 500 }
                                            overlay={
                                                <Tooltip id={`tooltip-${locData.id}-view-records`}>
                                                    Tokens records
                                                </Tooltip>
                                            }
                                        >
                                            <div>
                                                <Button
                                                    className="view-records"
                                                    onClick={ () => navigate(vtpTokensRecordPath(locData.id)) }
                                                >
                                                    <Icon icon={{id: "records_white"}}/>
                                                </Button>
                                            </div>
                                        </OverlayTrigger>
                                    }
                                </ButtonGroup>
                                
                            </ActionCell>
                        ,
                        width: width({
                            onSmallScreen: "100px",
                            otherwise: "120px"
                        }),
                        align: 'center',
                    },
                ] }
                data={ data }
                renderEmpty={ () => <EmptyTableMessage>No LOCs</EmptyTableMessage> }
            />
        </div>
    );
}
