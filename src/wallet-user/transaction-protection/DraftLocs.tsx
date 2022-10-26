import { LocType } from "@logion/node-api/dist/Types";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import IdentityLocRequestDetails from "../../components/identity/IdentityLocRequestDetails";
import { useUserContext } from "../UserContext";
import Table, { Cell, EmptyTableMessage, DateTimeCell } from '../../common/Table';
import LocStatusCell from '../../common/LocStatusCell';
import LegalOfficerName from '../../common/LegalOfficerNameCell';
import Loader from '../../common/Loader';
import ButtonGroup from "src/common/ButtonGroup";
import Button from "src/common/Button";
import { locDetailsPath } from "../UserRouter";

export interface Props {
    locType: LocType
}

export default function DraftLocs(props: Props) {
    const { locsState } = useUserContext();
    const navigate = useNavigate();
    const { locType } = props;

    const data = useMemo(() => locsState?.draftRequests[locType].map(locState => locState.data()) || [], [ locsState, locType ]);

    if(locsState === null || locsState?.draftRequests === undefined) {
        return <Loader />;
    }

    return (
        <Table
            columns={[
                {
                    header: "Legal officer",
                    render: locData => <LegalOfficerName address={ locData.ownerAddress } />,
                    renderDetails: locType === 'Identity' ? locData => <IdentityLocRequestDetails personalInfo={ locData }/> : undefined,
                    align: 'left',
                },
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
                                onClick={ () => navigate(locDetailsPath(locData.id, locData.locType)) }
                            >
                                Edit
                            </Button>
                        </ButtonGroup>
                    ),
                }
            ]}
            data={ data }
            renderEmpty={ () => <EmptyTableMessage>No draft request</EmptyTableMessage> }
        />
    );
}
