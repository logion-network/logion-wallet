import { LocData, LocRequestState } from "@logion/client";
import { LocType, UUID } from "@logion/node-api";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Button from "src/common/Button";
import ButtonGroup from "src/common/ButtonGroup";
import { useCommonContext } from "src/common/CommonContext";
import LegalOfficerName from "src/common/LegalOfficerNameCell";
import LocStatusCell from "src/common/LocStatusCell";
import Table, { Cell, Column, DateTimeCell, EmptyTableMessage } from "src/common/Table";
import UserIdentityNameCell from "src/common/UserIdentityNameCell";
import WorkInProgressLocDetails from "./WorkInProgressLocDetails";

export interface Props {
    locs: LocRequestState[];
    locDetailsPath: (locId: UUID, locType: LocType) => string;
}

export default function WorkInProgressLocs(props: Props) {
    const { viewer } = useCommonContext();
    const navigate = useNavigate();

    const columns = useMemo(() => {
        let result: Column<LocData>[] = [];
        if(viewer === "User") {
            result.push({
                header: "Legal officer",
                render: locData => <LegalOfficerName address={ locData.ownerAddress } />,
                renderDetails: locData => <WorkInProgressLocDetails locData={ locData } />,
                align: 'left',
            });
        } else {
            result.push({
                header: "Requester",
                render: request => <UserIdentityNameCell userIdentity={ request.userIdentity }/>,
                align: 'left',
            });
        }
        return result.concat([
            {
                "header": "Description",
                render: locData => <Cell content={ locData.description } overflowing tooltipId="description" />,
                align: 'left',
            },
            {
                header: "Status",
                render: locData => <LocStatusCell status={ locData.status }/>,
                width: "140px",
            },
            {
                header: "Creation date",
                render: locData => <DateTimeCell dateTime={ locData.createdOn || null } />,
                width: '200px',
                align: 'center',
            },
            {
                header: "Action",
                render: locData => (
                    <ButtonGroup>
                        <Button
                            onClick={ () => navigate(props.locDetailsPath(locData.id, locData.locType)) }
                        >
                            View
                        </Button>
                    </ButtonGroup>
                ),
            }
        ]);
    }, [ viewer, navigate, props ]);

    return (
        <Table
            columns={ columns }
            data={ props.locs.map(loc => loc.data()) }
            renderEmpty={ () => <EmptyTableMessage>No LOC waiting for an action from you</EmptyTableMessage> }
        />
    );
}
