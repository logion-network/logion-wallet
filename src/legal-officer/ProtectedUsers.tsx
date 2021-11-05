import { useLegalOfficerContext } from "./LegalOfficerContext";
import Table, { Cell, EmptyTableMessage } from '../common/Table';
import LegalOfficerName from '../common/LegalOfficerNameCell';
import ProtectedUserDetails from "./ProtectedUserDetails";
import { UUID } from "../logion-chain/UUID";

export default function ProtectedUsers() {
    const { activatedProtectionRequests } = useLegalOfficerContext();

    if(activatedProtectionRequests === null) {
        return null;
    }

    return (
        <Table
            columns={[
                {
                    header: "User",
                    render: request => <Cell content={ `${request.userIdentity.firstName} ${request.userIdentity.lastName}` }/>,
                    align: 'left',
                    renderDetails: request => <ProtectedUserDetails request={ request } />,
                },
                {
                    header: "Other Legal Officer",
                    render: request => <LegalOfficerName address={ request.otherLegalOfficerAddress }/>,
                    align: 'left',
                },
                {
                    header: "Identity LOC",
                    render: request => <Cell content={ new UUID(request.decision.locId!).toDecimalString() }/>,
                    align: 'left',
                },
            ]}
            data={ activatedProtectionRequests }
            renderEmpty={ () => <EmptyTableMessage>No user to display</EmptyTableMessage> }
        />
    );
}
