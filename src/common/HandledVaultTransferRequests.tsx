import { Currency } from "@logion/node-api";

import { useUserContext } from "../wallet-user/UserContext";
import AmountCell, { toPrefixedLgnt } from "./AmountCell";
import LegalOfficerName from "./LegalOfficerNameCell";
import { useResponsiveContext } from "./Responsive";
import Table, { Cell, DateTimeCell, EmptyTableMessage } from "./Table";
import VaultTransferRequestStatusCell from "./VaultTransferRequestStatusCell";

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
                        render: request => <LegalOfficerName address={ request.legalOfficerAddress } />,
                        align: 'left',
                    },
                    {
                        header: "Type",
                        render: () => <Cell content={`${Currency.SYMBOL}`} />,
                        width: '80px',
                    },
                    {
                        header: "Amount",
                        render: request => <AmountCell amount={ toPrefixedLgnt(request.amount) } />,
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
