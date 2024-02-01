import { useCallback, useState } from "react";
import { Lgnt } from "@logion/node-api";
import { VaultState, VaultTransferRequest } from "@logion/client";

import { useLogionChain } from "../logion-chain";
import AmountCell from "./AmountCell";
import Button from "./Button";
import ButtonGroup from "./ButtonGroup";
import Icon from "./Icon";

import LegalOfficerName from "./LegalOfficerNameCell";
import RequestToCancel from "./RequestToCancel";
import { useResponsiveContext } from "./Responsive";
import Table, { Cell, DateTimeCell, EmptyTableMessage } from "./Table";
import VaultTransferRequestDetails from "./VaultTransferDetails";
import { useUserContext } from "../wallet-user/UserContext";

export default function RejectedVaultTransferRequests() {
    const { getOfficer } = useLogionChain();
    const { mutateVaultState, vaultState } = useUserContext();
    const { width } = useResponsiveContext();
    const [ requestToCancel, setRequestToCancel ] = useState<VaultTransferRequest | null>(null);

    const resubmitRequestCallback = useCallback(async (request: VaultTransferRequest) => {
        (async function() {
            const legalOfficer = getOfficer!(request.legalOfficerAddress)!;
            await mutateVaultState((vaultState: VaultState) => vaultState.resubmitVaultTransferRequest(legalOfficer, request));
        })()
    }, [ mutateVaultState, getOfficer ]);

    if(!vaultState?.rejectedVaultTransferRequests) {
        return null;
    }

    return (
        <>
            <Table
                columns={[
                    {
                        header: "",
                        render: () => <Cell content={ <Icon icon={{ id: "rejected" }} height="30px" /> } />,
                        width: "50px",
                    },
                    {
                        header: "Legal Officer",
                        render: request => <LegalOfficerName address={ request.legalOfficerAddress } />,
                        align: 'left',
                        renderDetails: request => <VaultTransferRequestDetails request={ request } />,
                    },
                    {
                        header: "Type",
                        render: () => <Cell content={`${Lgnt.CODE}`} />,
                        width: '70px',
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
                        header: "Decision",
                        render: request => <DateTimeCell dateTime={ request.decision!.decisionOn } />,
                        width: '130px',
                    },
                    {
                        header: "Submit again?",
                        render: request => (
                            <ButtonGroup aria-label="actions">
                                <Button
                                    onClick={ () => setRequestToCancel(request) }
                                    variant="none"
                                >
                                    <Icon icon={{id: "ko"}} height='40px' />
                                </Button>
                                <Button
                                    onClick={ () => resubmitRequestCallback(request) }
                                    variant="none"
                                >
                                    <Icon icon={{id: "ok"}} height='40px' />
                                </Button>
                            </ButtonGroup>
                        ),
                        width: '130px',
                    },
                ]}
                data={ vaultState.rejectedVaultTransferRequests }
                renderEmpty={ () => <EmptyTableMessage>No request to display</EmptyTableMessage> }
            />
            <RequestToCancel
                requestToCancel={ requestToCancel }
                setRequestToCancel={ setRequestToCancel }
            />
        </>
    );
}
