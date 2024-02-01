import { useState } from "react";
import { Lgnt } from "@logion/node-api";
import { VaultTransferRequest } from "@logion/client";

import AmountCell from "./AmountCell";
import Clickable from "./Clickable";
import Icon from "./Icon";

import LegalOfficerName from "./LegalOfficerNameCell";
import RequestToCancel from "./RequestToCancel";
import { useResponsiveContext } from "./Responsive";
import Table, { Cell, DateTimeCell, EmptyTableMessage } from "./Table";
import { useUserContext } from "../wallet-user/UserContext";

export default function PendingVaultTransferRequests() {
    const { vaultState } = useUserContext();
    const { width } = useResponsiveContext();
    const [ requestToCancel, setRequestToCancel ] = useState<VaultTransferRequest | null>(null);

    if(!vaultState) {
        return null;
    }

    return (
        <>
            <Table
                columns={[
                    {
                        header: "",
                        render: () => <Cell content={ <Icon icon={{ id: "pending" }} height="30px" /> } />,
                        width: "50px",
                    },
                    {
                        header: "Legal Officer",
                        render: request => <LegalOfficerName address={ request.legalOfficerAddress } />,
                        align: 'left',
                    },
                    {
                        header: "Type",
                        render: () => <Cell content={`${Lgnt.CODE}`} />,
                        width: '80px',
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
                data={ vaultState!.pendingVaultTransferRequests }
                renderEmpty={ () => <EmptyTableMessage>No pending vault-out transfers</EmptyTableMessage> }
            />
            <RequestToCancel
                requestToCancel={ requestToCancel }
                setRequestToCancel={ setRequestToCancel }
            />
        </>
    );
}
