import { useNavigate } from "react-router-dom";
import ButtonGroup from 'react-bootstrap/ButtonGroup';

import Button from '../../common/Button';
import Table, { Column, Cell, EmptyTableMessage, DateTimeCell } from '../../common/Table';

import { useLegalOfficerContext } from '../LegalOfficerContext';
import RecoveryRequestStatus from './RecoveryRequestStatus';
import { recoveryDetailsPath } from "../LegalOfficerPaths";
import { useLogionChain } from '../../logion-chain';
import { RecoveryRequest } from '../Model';

export default function PendingRecoveryRequests() {
    const { api } = useLogionChain();
    const { pendingRecoveryRequests } = useLegalOfficerContext();
    const navigate = useNavigate();

    if (!api || pendingRecoveryRequests === null) {
        return null;
    }

    let columns: Column<RecoveryRequest>[];

    columns = [
        {
            header: "First name",
            render: request => <Cell content={ request.userIdentity.firstName } />,
            align: 'left',
        },
        {
            header: "Last name",
            render: request => <Cell content={ request.userIdentity.lastName } />,
            align: 'left',
        },
        {
            header: "Status",
            render: request => <RecoveryRequestStatus status={ request.status } type={ request.type } />,
            width: "140px",
        },
        {
            header: "Submission date",
            render: request => <DateTimeCell dateTime={ request.createdOn } />,
            width: "120px",
        },
        {
            header: "Type",
            render: request => <Cell content={ request.type } />,
            width: "200px",
        },
        {
            header: "Action",
            render: request => (
                <ButtonGroup aria-label="actions">
                    <Button
                        variant="primary"
                        onClick={ () => navigate(recoveryDetailsPath(request.id, request.type)) }
                    >
                        Review and proceed
                    </Button>
                </ButtonGroup>
            ),
            width: "300px",
        }
    ];

    return (
        <Table
            columns={ columns }
            data={ pendingRecoveryRequests }
            renderEmpty={ () => <EmptyTableMessage>No request to display</EmptyTableMessage> }
        />
    );
}
