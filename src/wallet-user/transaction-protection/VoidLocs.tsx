import React from 'react';

import { useCommonContext } from '../../common/CommonContext';
import Table, { Cell, EmptyTableMessage, DateTimeCell, ActionCell } from '../../common/Table';
import LocStatusCell from '../../common/LocStatusCell';
import LocIdCell from '../../common/LocIdCell';
import LegalOfficerName from '../../common/LegalOfficerNameCell';
import ButtonGroup from "../../common/ButtonGroup";
import Button from "../../common/Button";
import { fullCertificateUrl } from "../../PublicPaths";
import { UUID } from "../../logion-chain/UUID";

export default function VoidLocs() {
    const { voidTransactionLocs } = useCommonContext();

    if (voidTransactionLocs === null) {
        return null;
    }

    return (
        <Table
            columns={[
                {
                    "header": "Legal Officer",
                    render: request => <LegalOfficerName address={ request.request.ownerAddress } />,
                    align: 'left',
                },
                {
                    "header": "Description",
                    render: request => <Cell content={ request.request.description } />,
                    align: 'left',
                },
                {
                    header: "Status",
                    render: request => <LocStatusCell status={ request.request.status } voidLoc={true} />,
                    width: "140px",
                },
                {
                    header: "LOC ID",
                    render: request => <LocIdCell status={ request.request.status } id={ request.request.id }/>,
                    align: "left",
                },
                {
                    "header": "Creation date",
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
                                <Button onClick={ () => window.open(fullCertificateUrl(new UUID(request.request.id))) }>Certificate</Button>
                            </ButtonGroup>
                        </ActionCell>
                    ,
                    width: '200px',
                    align: 'center',
                },
            ]}
            data={ voidTransactionLocs }
            renderEmpty={ () => <EmptyTableMessage>No LOCs</EmptyTableMessage>}
        />
    );
}
