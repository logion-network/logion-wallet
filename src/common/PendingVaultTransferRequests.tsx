import { useMemo, useState } from "react";
import { Lgnt, ValidAccountId } from "@logion/node-api";
import { VaultTransferRequest } from "@logion/client";

import AmountCell from "./AmountCell";
import Clickable from "./Clickable";
import Icon from "./Icon";

import LegalOfficerName from "./LegalOfficerNameCell";
import RequestToCancel from "./RequestToCancel";
import { useResponsiveContext } from "./Responsive";
import Table, { Cell, DateTimeCell, EmptyTableMessage } from "./Table";
import { useUserContext } from "../wallet-user/UserContext";
import VaultTransferRequestDetails from "./VaultTransferDetails";
import VaultTransferRequestStatusCell from "./VaultTransferRequestStatusCell";

export default function PendingVaultTransferRequests() {
    const { vaultState } = useUserContext();
    const { width } = useResponsiveContext();
    const [ requestToCancel, setRequestToCancel ] = useState<VaultTransferRequest | null>(null);

    const pendingRequests = useMemo(() => {
        const pending = vaultState?.pendingVaultTransferRequests || [];
        const rejected = vaultState?.rejectedVaultTransferRequests || [];
        return pending.concat(rejected).sort((a, b) => a.createdOn.localeCompare(b.createdOn));
    }, [ vaultState ]);

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
                        header: "",
                        render: request => (
                            <Cell content={ <Clickable
                                onClick={ () => setRequestToCancel(request) }
                            >
                                <Icon icon={{id: "ko"}} />
                            </Clickable> } />
                        ),
                        width: '130px',
                    },
                ]}
                data={ pendingRequests }
                renderEmpty={ () => <EmptyTableMessage>No pending vault-out transfers</EmptyTableMessage> }
            />
            <RequestToCancel
                requestToCancel={ requestToCancel }
                setRequestToCancel={ setRequestToCancel }
            />
        </>
    );
}
