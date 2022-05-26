import { prefixedLogBalance, SYMBOL } from "@logion/node-api/dist/Balances";

import AmountCell from "../../common/AmountCell";
import { useResponsiveContext } from "../../common/Responsive";
import Table, { Cell, DateTimeCell, EmptyTableMessage } from "../../common/Table";
import VaultTransferRequestStatusCell from "../../common/VaultTransferRequestStatusCell";
import UserIdentityNameCell from "../../common/UserIdentityNameCell";

import VaultTransferRequestDetails from "./VaultTransferDetails";
import { useLegalOfficerContext } from "../LegalOfficerContext";

export default function VaultTransferRequestsHistory() {
    const { vaultTransferRequestsHistory } = useLegalOfficerContext();
    const { width } = useResponsiveContext();

    if(!vaultTransferRequestsHistory) {
        return null;
    }

    return (
        <>
            <Table
                columns={[
                    {
                        header: "User",
                        render: request => <UserIdentityNameCell userIdentity={ request.requesterIdentity } />,
                        align: "left",
                        renderDetails: request => <VaultTransferRequestDetails request={ request }/>
                    },
                    {
                        header: "Type",
                        render: () => <Cell content={`${SYMBOL}`} />,
                        width: '80px',
                    },
                    {
                        header: "Amount",
                        render: request => <AmountCell amount={ prefixedLogBalance(request.amount) } />,
                        align: 'right',
                        width: width({
                            onSmallScreen: "100px",
                            otherwise: "120px"
                        }),
                    },
                    {
                        header: "Status",
                        render: request => <VaultTransferRequestStatusCell status={ request.status } viewer="Legal Officer" />,
                        width: '200px',
                    },
                    {
                        header: "Creation date",
                        render: request => <DateTimeCell dateTime={ request.createdOn } />,
                        width: '130px',
                    },
                ]}
                data={ vaultTransferRequestsHistory }
                renderEmpty={ () => <EmptyTableMessage>No pending vault-out transfers</EmptyTableMessage> }
            />
        </>
    );
}
