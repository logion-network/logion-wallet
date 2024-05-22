import Table, { Cell, EmptyTableMessage, DateTimeCell } from '../../common/Table';

import { useLegalOfficerContext } from '../LegalOfficerContext';
import RecoveryRequestDetails from './RecoveryRequestDetails';
import RecoveryRequestStatus from './RecoveryRequestStatus';

export default function RecoveryRequestsHistory() {
    const { recoveryRequestsHistory } = useLegalOfficerContext();

    if (recoveryRequestsHistory === null) {
        return null;
    }

    return (
        <>
            <Table
                columns={[
                    {
                        header: "First name",
                        render: request => <Cell content={ request.userIdentity.firstName }/>,
                        align: 'left',
                    },
                    {
                        header: "Last name",
                        render: request => <Cell content={ request.userIdentity.lastName }/>,
                        align: 'left',
                        renderDetails: request => <RecoveryRequestDetails request={ request } />
                    },
                    {
                        header: "Status",
                        render: request => <RecoveryRequestStatus status={ request.status } type={ request.type } />,
                        width: "170px",
                    },
                    {
                        header: "Submission date",
                        render: request => <DateTimeCell dateTime={ request.createdOn } />,
                        width: "120px",
                    },
                    {
                        header: "Type",
                        render: request => <Cell content={ request.type } />,
                        width: "120px",
                    },
                ]}
                data={ recoveryRequestsHistory }
                renderEmpty={ () => <EmptyTableMessage>No processed request</EmptyTableMessage>}
            />
        </>
    );
}
