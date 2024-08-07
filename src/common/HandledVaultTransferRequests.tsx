import { Lgnt, ValidAccountId } from "@logion/node-api";

import { useUserContext } from "../wallet-user/UserContext";
import AmountCell from "./AmountCell";
import LegalOfficerName from "./LegalOfficerNameCell";
import { useResponsiveContext } from "./Responsive";
import Table, { DateTimeCell, EmptyTableMessage } from "./Table";
import VaultTransferRequestStatusCell from "./VaultTransferRequestStatusCell";
import VaultTransferRequestDetails from "./VaultTransferDetails";

export default function HandledVaultTransferRequests() {
    const { width } = useResponsiveContext();
    const { vaultState } = useUserContext();

    if(!vaultState) {
        return null;
    }

    return (
        <>
            <Table
                columns={[
                    {
                        header: "Legal Officer",
                        render: request => <LegalOfficerName address={ ValidAccountId.polkadot(request.legalOfficerAddress) } />,
                        align: 'left',
                        renderDetails: request => <VaultTransferRequestDetails request={ request } />,
                    },
                    {
                        header: "Amount",
                        render: request => <AmountCell amount={ Lgnt.fromCanonical(BigInt(request.amount)) } />,
                        align: 'right',
                        width: width({
                            onSmallScreen: "100px",
                            otherwise: "120px"
                        }),
                    },
                    {
                        header: "Status",
                        render: request => <VaultTransferRequestStatusCell status={ request.status } viewer="Wallet User" />,
                        width: '150px',
                    },
                    {
                        header: "Creation date",
                        render: request => <DateTimeCell dateTime={ request.createdOn } />,
                        width: '130px',
                    },
                    {
                        header: "Decision",
                        render: request => <DateTimeCell dateTime={ request.decision!.decisionOn } />,
                        width: '130px',
                    },
                ]}
                data={ vaultState.vaultTransferRequestsHistory }
                renderEmpty={ () => <EmptyTableMessage>No request to display</EmptyTableMessage> }
            />
        </>
    );
}
