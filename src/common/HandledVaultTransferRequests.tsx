import { prefixedLogBalance, SYMBOL } from "../logion-chain/Balances";
import { VaultTransferRequest } from "../vault/VaultApi";
import AmountCell from "./AmountCell";

import LegalOfficerName from "./LegalOfficerNameCell";
import { useResponsiveContext } from "./Responsive";
import Table, { Cell, DateTimeCell, EmptyTableMessage } from "./Table";
import VaultTransferRequestStatusCell from "./VaultTransferRequestStatusCell";

interface Props {
    requests: VaultTransferRequest[] | null,
    decisionOnLabel: string
}

export default function HandledVaultTransferRequests(props: Props) {
    const { width } = useResponsiveContext();

    if(!props.requests) {
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
                        render: request => <VaultTransferRequestStatusCell status={ request.status } />,
                        width: '150px',
                    },
                    {
                        header: "Creation date",
                        render: request => <DateTimeCell dateTime={ request.createdOn } />,
                        width: '130px',
                    },
                    {
                        header: props.decisionOnLabel,
                        render: request => <DateTimeCell dateTime={ request.decision!.decisionOn } />,
                        width: '130px',
                    },
                ]}
                data={ props.requests }
                renderEmpty={ () => <EmptyTableMessage>No request to display</EmptyTableMessage> }
            />
        </>
    );
}
